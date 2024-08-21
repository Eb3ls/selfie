import {
	generateMessageResponse,
	generateStringModel,
	validate
} from "@/utils/api/api";
import {
	SESSION_COLLECTION,
	Session,
	StringSession,
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
	pomodoro: {
		cycles: 0,
		cyclesCompleted: 0,
		studyDuration: 0,
		breakDuration: 0,
		alarms: []
	}
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

	// Assumiamo che la validazione abbia validato anche il pomodoro

	// Creiamo una nuova sessione con quei campi
	const newSession: StringSession = generateStringModel<StringSession>(
		newBody,
		"Session"
	);

	// Aggiungiamo il campo 'owner' a newSession
	newSession.ownerId = owner._id!;

	// Ottieniamo la collezione delle sessioni
	const client: Collection<Session> =
		await getCollection<Session>(SESSION_COLLECTION);

	return await addCollectionWrapper(newSession, client);
};
