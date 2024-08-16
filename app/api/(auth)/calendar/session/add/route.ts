import { NextRequest } from "next/server";
import { Collection } from "mongodb";
import { getCollection, SESSION_COLLECTION } from "@/db_utils/db_functions";
import { addCollectionWrapper } from "@/db_utils/db_wrappers";
import { Session, createSession } from "@/db_utils/models/Session";
import { createPomodoro } from "@/db_utils/models/Pomodoro";
import {
	isTemplateValid,
	generateMessageResponse,
	standardValidation,
} from "@/api_utils/api_functions";

const requestTemplate: Partial<Session> = {
	summary: "",
	description: "",
	status: "",
	rrule: "",
	dtStart: new Date(),
	dtEnd: new Date(),
	dtStamp: new Date(),
	pomodoro: createPomodoro({}),
};

export const POST = async (request: NextRequest) => {
	// Validazione standard
	const validation = await standardValidation<Session>(
		request,
		requestTemplate,
		true
	);

	// Se la validazione fallisce, ritorna il messaggio di errore
	if (validation === null) {
		return generateMessageResponse("Invalid request", 400);
	}

	// Estraiamo l'utente e il corpo della richiesta
	const { user: owner, body: newBody } = validation;

	// Controlliamo che il pomodoro abbia tutti i campi necessari
	if (!isTemplateValid(newBody.pomodoro!, createPomodoro({}))) {
		return generateMessageResponse("Invalid input", 400);
	}

	// Creiamo una nuova sessione con quei campi
	const newSession: Session = createSession(newBody);

	// Aggiungiamo il campo 'owner' a newSession
	newSession.owner = owner._id!;

	// Ottieniamo la collezione delle sessioni
	const client: Collection<Session> = await getCollection<Session>(
		SESSION_COLLECTION
	);

	return await addCollectionWrapper(newSession, client);
};
