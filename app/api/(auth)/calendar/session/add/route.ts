import { NextRequest } from "next/server";
import { Collection, WithId, ObjectId } from "mongodb";
import {
	getCollection,
	SESSION_COLLECTION,
	addAndFetchToCollection,
} from "@/db_utils/db_functions";

import { createSession, Session } from "@/db_utils/models/Session";
import {
	parseJSONInput,
	generateMessageResponse,
	isTemplateValid,
	generateObjectResponse,
	stringsToObjects,
} from "@/api_utils/api_functions";
import { getSession } from "@/session_utils/session";
import { JWTPayload } from "jose";
import { User } from "@/db_utils/models/User";
import { createPomodoro, Pomodoro } from "@/db_utils/models/Pomodoro";

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
	// Prendiamo i cookie della richiesta
	const cookies: JWTPayload = (await getSession(
		request.cookies
	)) as JWTPayload; // Assumiamo che la sessione sia stata validata dal middleware

	const owner: Partial<User> = cookies.user as Partial<User>;

	// Convertiamo in JSON il body della richiesta
	const body: Object | undefined = await parseJSONInput(request);
	if (body === undefined) {
		return generateMessageResponse("Invalid input", 400);
	}

	// Cambio le stringhe date in oggetti Date
	const newBody: any = stringsToObjects(body);

	// Controlliamo che il body abbia tutti i campi necessari
	if (!isTemplateValid(newBody, requestTemplate)) {
		return generateMessageResponse("Invalid input", 400);
	}

	// Controlliamo che il pomodoro abbia tutti i campi necessari
	if (!isTemplateValid(newBody.pomodoro, createPomodoro({}))) {
		return generateMessageResponse("Invalid input", 400);
	}

	// Creiamo un nuovo Sessiono con quei campi
	const newSession: Session = createSession(newBody);

	// Aggiungiamo il campo 'owner' a newSession
	newSession.owner = owner._id as ObjectId; // Assumiamo che la sessione sia corretta

	// Ottieniamo la collezione degli Sessioni
	const client: Collection<Session> = await getCollection<Session>(
		SESSION_COLLECTION
	);

	// Aggiungi il nuovo Sessiono al db
	const insertedSession: WithId<Session> | null | undefined =
		await addAndFetchToCollection<Session>(newSession, client);
	if (insertedSession === undefined) {
		return generateMessageResponse("Error with DB connection", 400);
	} else if (insertedSession === null) {
		return generateMessageResponse(
			"Error while trying to add Session (Should never happen)",
			400
		);
	}

	return generateObjectResponse(insertedSession, 200);
};
