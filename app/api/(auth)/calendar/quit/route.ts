import { generateMessageResponse, validate } from "@/utils/api/api";
import {
	ACTIVITY_COLLECTION,
	Activity,
	EVENT_COLLECTION,
	Event,
	StringActivity,
	StringEvent,
	findCollectionWrapper,
	getCollection,
	updateCollectionWrapper
} from "@/utils/db/db";
import { Collection } from "mongodb";
import { NextRequest } from "next/server";

const requestTemplate = {
	_id: "",
	type: ""
};

type RequestType = typeof requestTemplate;

export const POST = async (request: NextRequest) => {
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
	const { user: owner, body: newBody } = validation;

	// Estraiamo l'id dell'utente
	const userId: string = owner._id!;

	// Se il type è "EVENT", allora cerchiamo fra gli eventi
	if (newBody.type === "EVENT") {
		// Estraiamo l'id dell'evento
		const eventId: string = newBody._id;

		// Ottieniamo la collezione degli eventi
		const client: Collection<Event> =
			await getCollection<Event>(EVENT_COLLECTION);

		// Cerchiamo l'evento
		const out = await findCollectionWrapper<Event>(
			{ _id: eventId },
			client
		);

		if (out.status !== 200) {
			return out;
		}

		const event: StringEvent = (await out.json())[0];

		// Controlliamo che l'utente che ha fatto la richiesta non sia l'owner
		if (event.ownerId === userId) {
			return generateMessageResponse(
				"You cannot quit your own event",
				400
			);
		}

		// Controlliamo che l'utente sia presente nella lista degli utenti
		if (!event.userIdList.includes(userId)) {
			return generateMessageResponse("You are not in the event", 400);
		}

		// Rimuoviamo l'utente dalla lista degli utenti
		const newUserIdList = event.userIdList.filter(
			(userIdList) => userIdList !== userId
		);

		// Modifichiamo l'evento
		const updateOut = await updateCollectionWrapper<Event>(
			{ _id: eventId },
			{ $set: { userIdList: newUserIdList } } as any,
			client
		);

		if (updateOut.status !== 200) {
			return updateOut;
		}
	} else if (newBody.type === "ACTIVITY") {
		// Estraiamo l'id dell'attività
		const activityId: string = newBody._id;

		// Ottieniamo la collezione delle attività
		const client: Collection<Activity> =
			await getCollection<Activity>(ACTIVITY_COLLECTION);

		const out = await findCollectionWrapper<Activity>(
			{ _id: activityId },
			client
		);

		if (out.status !== 200) {
			return out;
		}

		const activity: StringActivity = (await out.json())[0];

		// Controlliamo che l'utente che ha fatto la richiesta non sia l'owner
		if (activity.ownerId === userId) {
			return generateMessageResponse(
				"You cannot quit your own activity",
				400
			);
		}

		// Controlliamo che l'utente sia presente nella lista degli utenti
		if (!activity.userIdList.includes(userId)) {
			return generateMessageResponse("You are not in the activity", 400);
		}

		const newUserIdList = activity.userIdList.filter(
			(userIdList) => userIdList !== userId
		);

		const updateOut = await updateCollectionWrapper<Activity>(
			{ _id: activityId },
			{ $set: { userIdList: newUserIdList } } as any,
			client
		);

		if (updateOut.status !== 200) {
			return updateOut;
		}
	}

	// Se siamo arrivati qui, la richiesta è andata a buon fine
	return generateMessageResponse("Operation completed", 200);
};
