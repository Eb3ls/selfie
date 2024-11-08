import {
	addInvitations,
	generateMessageResponse,
	generateObjectResponse,
	generateStringModel,
	removeArrayDuplicates,
	validate
} from "@/utils/api/api";
import {
	EVENT_COLLECTION,
	Event,
	StringEvent,
	addCollectionWrapper,
	getCollection
} from "@/utils/db/db";
import { Collection } from "mongodb";
import { NextRequest } from "next/server";

const requestTemplate = {
	summary: "",
	description: "",
	status: "",
	rrule: "",
	dtStart: "",
	dtEnd: "",
	categories: [""],
	location: "",
	geo: "",
	userIdList: [""],
	alarms: []
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

	// Creiamo un nuovo evento con quei campi
	const newEvent: StringEvent = generateStringModel<StringEvent>(
		newBody,
		"Event"
	);

	// Otteniamo gli utenti da invitare
	const usersToBeInvited = removeArrayDuplicates(
		newEvent.userIdList.filter((userId) => userId !== owner._id)
	);

	// Aggiungiamo il campo 'owner' a newEvent
	newEvent.ownerId = owner._id!;
	newEvent.userIdList = [owner._id!];

	// Ottieniamo la collezione degli eventi
	const client: Collection<Event> =
		await getCollection<Event>(EVENT_COLLECTION);

	const eventOut = await addCollectionWrapper(newEvent, client);

	if (eventOut.status !== 200) {
		return eventOut;
	}

	const createdEvent: StringEvent = await eventOut.json();

	// Invitiamo gli utenti
	const inviteOut = await addInvitations(
		usersToBeInvited,
		"EVENT",
		createdEvent._id!
	);

	if (inviteOut.status !== 200) {
		return inviteOut;
	}

	return generateObjectResponse(createdEvent, 200);
};
