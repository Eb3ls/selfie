import { NextRequest } from "next/server";
import { Collection, ObjectId, WithId } from "mongodb";
import {
	parseJSONInput,
	generateMessageResponse,
	isTemplateValid,
	generateObjectResponse,
	stringsToObjects,
} from "@/api_utils/api_functions";
import {
	getCollection,
	SESSION_COLLECTION,
	updateOneAndFetchInCollection,
	findInCollection,
} from "@/db_utils/db_functions";
import { Session } from "@/db_utils/models/Session";
import { JWTPayload } from "jose";
import { getSession } from "@/session_utils/session";
import { User } from "@/db_utils/models/User";

const requestTemplate = {
	sessionId: new ObjectId(),
	cycles: 0,
};

export const PATCH = async (request: NextRequest) => {
	// Prendiamo i cookie della richiesta
	const cookies: JWTPayload = (await getSession(
		request.cookies
	)) as JWTPayload; // Assumiamo che la sessione sia stata validata dal middleware

	const user: Partial<User> = cookies.user as Partial<User>;
	const userId: any = user._id;
	// Convertiamo in JSON il body della richiesta
	const body: Object | undefined = await parseJSONInput(request);
	if (body === undefined) {
		return generateMessageResponse("Invalid input", 400);
	}

	// Cambio le stringhe che dovrebbero essere oggetti in oggetti
	const newBody: any = stringsToObjects(body);

	// Controlliamo che il body abbia tutti i campi necessari
	if (!isTemplateValid(newBody, requestTemplate)) {
		return generateMessageResponse("Invalid input", 400);
	}

	// Estraggo l'id dal body
	const sessionId: ObjectId = newBody.sessionId;

	// Ottieniamo la collezione degli Sessioni
	const client: Collection<Session> = await getCollection<Session>(
		SESSION_COLLECTION
	);

	// Controlliamo che l'owner sia l'utente corrispondente
	const session: WithId<Session>[] | undefined =
		await findInCollection<Session>({ _id: sessionId }, client);

	if (session === undefined) {
		return generateMessageResponse("Error in database", 400);
	} else if (session.length === 0) {
		return generateMessageResponse("Session not found", 400);
	} else if (session[0].owner.toString() !== userId.toString()) {
		console.log(session[0].owner.toString(), userId.toString());
		return generateMessageResponse("Unauthorized", 400);
	}

	let updatedSession: Session = { ...session[0] };
	updatedSession.pomodoro.cycles = newBody.cycles;

	// Modifichiamo la session
	const modifiedSession: WithId<Session> | undefined | null =
		await updateOneAndFetchInCollection<Session>(
			sessionId,
			updatedSession,
			client
		);

	if (modifiedSession === undefined) {
		return generateMessageResponse("Error in database", 400);
	} else if (modifiedSession === null) {
		return generateMessageResponse("Session not found", 400);
	}

	return generateObjectResponse(modifiedSession.pomodoro, 200);
};
