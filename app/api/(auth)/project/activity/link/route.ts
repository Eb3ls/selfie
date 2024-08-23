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
	prevId: "",
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
	const prevId: string = newBody.prevId;
	const nextId: string = newBody.nextId;

	if (prevId === nextId) {
		return generateMessageResponse(
			"The projectActivities can't be the same",
			400
		);
	}

	// Otteniamo la collezione delle attività
	const projectActivityClient: Collection<ProjectActivity> =
		await getCollection<ProjectActivity>(PROJECT_ACTIVITY_COLLECTION);

	const prevActivityOut = await findCollectionWrapper<ProjectActivity>(
		{ _id: prevId },
		projectActivityClient
	);

	if (prevActivityOut.status !== 200) {
		return prevActivityOut;
	}

	const prevActivity: StringProjectActivity = (
		await prevActivityOut.json()
	)[0];

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
	if (prevActivity.ownerId !== userId) {
		return generateMessageResponse("Unauthorized", 400);
	}

	// Controlliamo che appartengano allo stesso progetto
	if (prevActivity.projectId !== nextActivity.projectId) {
		return generateMessageResponse(
			"The projectActivities must belong to the same project",
			400
		);
	}

	// Controlliamo se le attività sono già collegate
	if (prevActivity.nextIdList.includes(nextId)) {
		return generateMessageResponse("Already linked", 400);
	}

	// Controlliamo se le attività sono in ordine temporale
	if (
		prevActivity.dtStart > nextActivity.dtStart ||
		prevActivity.due > nextActivity.due
	) {
		return generateMessageResponse(
			"Activities can't be in the same period of time",
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

	// Inseriamo l'id dell'attività precedente nell'array delle attività precedenti del next
	let nextModifiedIds = nextActivity.prevIdList;
	nextModifiedIds.push(prevId);

	// Inseriamo l'id dell'attività successiva nell'array delle attività successive del prev
	let prevModifiedIds = prevActivity.nextIdList;
	prevModifiedIds.push(nextId);

	const prevModifiedOut = await updateCollectionWrapper<ProjectActivity>(
		{ _id: prevId },
		{
			$set: { nextIdList: prevModifiedIds }
		} as any,
		projectActivityClient
	);

	if (prevModifiedOut.status !== 200) {
		return prevModifiedOut;
	}

	// Controlliamo se l'attività successiva può essere attivabile
	let newStatus = "ACTIVABLE";
	if (
		prevActivity.status !== "COMPLETED" ||
		nextActivity.status === "WAITING"
	) {
		newStatus = "WAITING";
	}

	const nextModifiedOut = await updateCollectionWrapper<ProjectActivity>(
		{ _id: nextId },
		{
			$set: { prevIdList: nextModifiedIds, status: newStatus }
		} as any,
		projectActivityClient
	);

	if (nextModifiedOut.status !== 200) {
		return nextModifiedOut;
	}

	const prevModified: StringProjectActivity = (
		await prevModifiedOut.json()
	)[0];
	const nextModified: StringProjectActivity = (
		await nextModifiedOut.json()
	)[0];

	return generateObjectResponse(
		{ prevData: prevModified, nextData: nextModified },
		200
	);
};
