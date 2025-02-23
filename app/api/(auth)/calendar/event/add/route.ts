import {
	addInvitations,
	generateMessageResponse,
	generateObjectResponse,
	generateStringModel,
	usernameListToIds,
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
	categories: "",
	location: "",
	geo: "",
	usernameList: [""],
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

	// Estraiamo l'id dell'utente
	const userId: string = owner._id!;

	// Estriamo la lista degli username dal body
	const usernameList: string[] = newBody.usernameList;

	// Convertiamo lo username in id e aggiungiamo lo userId come primo elemento
	const convertionOut = await usernameListToIds(usernameList, userId, true);

	if (convertionOut.status !== 200) {
		return convertionOut;
	}

	const userIdList: string[] = (await convertionOut.json()).users;

	// Sostituiamo la lista degli username con quella degli id, rimuovendo usernameList
	const { usernameList: _, ...smallBody } = newBody;
	const convertedBody = { userIdList: userIdList, ...smallBody };

	// Creiamo un nuovo evento con quei campi
	const newEvent: StringEvent = generateStringModel<StringEvent>(
		convertedBody,
		"Event"
	);

	// Otteniamo gli utenti da invitare
	const usersToBeInvited = newEvent.userIdList.filter((id) => id !== userId);

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
