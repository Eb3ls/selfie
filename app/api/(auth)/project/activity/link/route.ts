import {
	generateMessageResponse,
	generateObjectResponse,
	validate
} from "@/utils/api/api";
import {
	PROJECT_ACTIVITY_COLLECTION,
	ProjectActivity,
	StringProjectActivity,
	findCollectionWrapper,
	getCollection,
	updateCollectionWrapper
} from "@/utils/db/db";
import { Collection, ObjectId } from "mongodb";
import { NextRequest } from "next/server";

const requestTemplate = {
	prevIds: [],
	nextId: ""
};

type RequestType = typeof requestTemplate;

export const PATCH = async (request: NextRequest) => {
	// Validazione della richiesta
	const validation = await validate<RequestType>(
		request,
		requestTemplate,
		false
	);

	// Se la validazione fallisce, ritorna il messaggio di errore
	if (validation === null) {
		return generateMessageResponse("Invalid request", 400);
	}

	// Estraiamo l'utente e il corpo della richiesta
	const { user: user, body: newBody } = validation;

	// Estraiamo l'id dell'utente
	const userId: string = user._id!;

	// Estraiamo il prevId e il nextId dal body
	const requestedPrevIds: string[] = newBody.prevIds;
	const requestedNextId: string = newBody.nextId;

	if (
		!Array.isArray(requestedPrevIds) ||
		!ObjectId.isValid(requestedNextId) ||
		requestedPrevIds.some((id) => typeof id !== "string" || !ObjectId.isValid(id))
	) {
		return generateMessageResponse("Invalid request", 400);
	}

	// MongoDB accepts either hex case; compare the canonical form everywhere.
	const prevIds = requestedPrevIds.map((id) => new ObjectId(id).toHexString());
	const nextId = new ObjectId(requestedNextId).toHexString();

	if (prevIds.includes(nextId)) {
		return generateMessageResponse(
			"The projectActivities can't be the same",
			400
		);
	}

	// Otteniamo la collezione delle attività
	const projectActivityClient: Collection<ProjectActivity> =
		await getCollection<ProjectActivity>(PROJECT_ACTIVITY_COLLECTION);

	const nextActivityOut = await findCollectionWrapper<ProjectActivity>(
		{ _id: nextId },
		projectActivityClient
	);

	if (nextActivityOut.status !== 200) {
		return nextActivityOut;
	}

	const nextActivity: StringProjectActivity = (
		await nextActivityOut.json()
	)[0];

	// Controlliamo che l'owner dell'attività da modificare sia l'utente corrispondente
	if (nextActivity.ownerId !== userId) {
		return generateMessageResponse("Unauthorized", 400);
	}

	const allActivitiesOut = await findCollectionWrapper<ProjectActivity>(
		{ projectId: nextActivity.projectId },
		projectActivityClient
	);

	if (allActivitiesOut.status !== 200) {
		return allActivitiesOut;
	}

	const allActivities: StringProjectActivity[] =
		await allActivitiesOut.json();

	// Selezioniamo le attivitá che ci interessano
	const prevActivities = allActivities.filter((activity) =>
		prevIds.includes(activity._id!)
	);

	// Controlliamo che tutte le attività precedenti richieste esistano
	if (
		prevIds.some(
			(id) => !prevActivities.some((activity) => activity._id === id)
		)
	) {
		return generateMessageResponse("No data found", 404);
	}

	// Controlliamo che l'owner sia l'utente corrispondente
	if (prevActivities.some((activity) => activity.ownerId !== userId)) {
		return generateMessageResponse("Unauthorized", 400);
	}

	// Controlliamo che appartengano allo stesso progetto
	if (
		prevActivities.some(
			(activity) => activity.projectId !== nextActivity.projectId
		)
	) {
		return generateMessageResponse(
			"The projectActivities must belong to the same project",
			400
		);
	}

	// Controlliamo se le prevActivities sono prima della nextActivity
	if (
		prevActivities.some(
			(activity) =>
			activity.dtStart > nextActivity.dtStart ||
			activity.due > nextActivity.due
		)
	) {
		return generateMessageResponse(
			"Activities can't be in the same period of time",
			400
		);
	}

	// Controlliamo che tra le attività precedenti non ci siano attività DROPPED
	if (prevActivities.some((activity) => activity.status === "DROPPED")) {
		return generateMessageResponse(
			"Can't link an activity with a dropped activity",
			400
		);
	}

	// Controlliamo se l'attività successiva è già attiva
	if (
		nextActivity.status !== "ACTIVABLE" &&
		nextActivity.status !== "WAITING"
	) {
		return generateMessageResponse("Can't link an active activity", 400);
	}
	// Rimuoviamo l'id dell'attività successiva dalle attività che erano precedentemente collegate
	const oldPrevIdList = allActivities.filter((activity) =>
		activity.nextIdList.includes(nextId)
	);

	if (oldPrevIdList.some((activity) => activity.ownerId !== userId)) {
		return generateMessageResponse("Unauthorized", 400);
	}

	oldPrevIdList.forEach((activity) => {
		activity.nextIdList = activity.nextIdList.filter((id) => id !== nextId);
	});

	// Inseriamo l'id dell'attività successiva nell'array delle attività successive del prev
	for (const activity of prevActivities) {
		if (!activity.nextIdList.includes(nextId)) {
			activity.nextIdList.push(nextId);
		}
	}

	for (const activity of oldPrevIdList) {
		const updateResult = await updateCollectionWrapper<ProjectActivity>(
			{ _id: activity._id },
			{
				$set: { nextIdList: activity.nextIdList }
			} as any,
			projectActivityClient
		);
		if (updateResult.status !== 200) {
			return updateResult;
		}
	}

	// Aggiorniamo le attività precedenti
	for (const activity of prevActivities) {
		const updateResult = await updateCollectionWrapper<ProjectActivity>(
			{ _id: activity._id },
			{
				$set: { nextIdList: activity.nextIdList }
			} as any,
			projectActivityClient
		);
		if (updateResult.status !== 200) {
			return updateResult;
		}
	}

	// Se anche solo una delle attivitá precedenti non é completata, la successiva deve essere in attesa
	let newStatus = "ACTIVABLE";
	for (const activity of prevActivities) {
		if (activity.status !== "COMPLETED" && activity.status !== "DROPPED") {
			newStatus = "WAITING";
			break;
		}
	}

	// Aggiorniamo l'attività successiva, la lista di attivitá precedenti é quella passata
	const prevIdList = prevActivities.map((activity) => activity._id!);
	const nextModifiedOut = await updateCollectionWrapper<ProjectActivity>(
		{ _id: nextId },
		{
			$set: { prevIdList: prevIdList, status: newStatus }
		} as any,
		projectActivityClient
	);

	if (nextModifiedOut.status !== 200) {
		return nextModifiedOut;
	}

	return generateObjectResponse("Successfully linked", 200);
};
