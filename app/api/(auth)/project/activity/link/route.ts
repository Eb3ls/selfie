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
import { Collection } from "mongodb";
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
	const prevIds: string[] = newBody.prevIds;
	const nextId: string = newBody.nextId;

	if (prevIds.includes(nextId)) {
		return generateMessageResponse(
			"The projectActivities can't be the same",
			400
		);
	}

	// Otteniamo la collezione delle attività
	const projectActivityClient: Collection<ProjectActivity> =
		await getCollection<ProjectActivity>(PROJECT_ACTIVITY_COLLECTION);

	const allActivitiesOut = await findCollectionWrapper<ProjectActivity>(
		{},
		projectActivityClient
	);

	if (allActivitiesOut.status !== 200) {
		return generateMessageResponse("Invalid request", 400);
	}

	const allActivities: StringProjectActivity[] =
		await allActivitiesOut.json();

	// Selezioniamo le attivitá che ci interessano
	const prevActivities = allActivities.filter((activity) =>
		prevIds.includes(activity._id!)
	);

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
	prevActivities.forEach((activity) => {
		if (
			activity.dtStart > nextActivity.dtStart ||
			activity.due > nextActivity.due
		) {
			return generateMessageResponse(
				"Activities can't be in the same period of time",
				400
			);
		}
	});

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
		if (activity.status !== "COMPLETED") {
			newStatus = "WAITING";
			break;
		}
	}
	if (nextActivity.status === "WAITING") {
		newStatus = "WAITING";
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
