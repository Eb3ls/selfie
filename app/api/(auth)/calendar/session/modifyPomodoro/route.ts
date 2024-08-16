import { NextRequest } from "next/server";
import { Collection, ObjectId } from "mongodb";
import { getCollection, SESSION_COLLECTION } from "@/db_utils/db_functions";
import {
	findCollectionWrapper,
	updateOneCollectionWrapper,
} from "@/db_utils/db_wrappers";
import { Session } from "@/db_utils/models/Session";
import {
	generateMessageResponse,
	standardValidation,
} from "@/api_utils/api_functions";

const requestTemplate = {
	sessionId: new ObjectId(),
	cycles: 0,
};

export const PATCH = async (request: NextRequest) => {
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
	const { user: user, body: getBody } = validation;
	const newBody = getBody as { sessionId: ObjectId; cycles: number };

	// Estraggo l'id dell'utente
	const userId: ObjectId = user._id!;

	// Estraggo l'id dal body
	const sessionId: ObjectId = newBody.sessionId!;

	// Ottieniamo la collezione delle sessioni
	const client: Collection<Session> = await getCollection<Session>(
		SESSION_COLLECTION
	);

	const out = await findCollectionWrapper<Session>(
		{ _id: sessionId },
		client
	);

	if (out.status !== 200) {
		return out;
	}

	const session: Session[] = await out.json();

	// Controlliamo che l'owner sia l'utente corrispondente
	if (session[0].owner.toString() !== userId.toString()) {
		return generateMessageResponse("Unauthorized", 400);
	}

	let updatedSession: Session = { ...session[0] };
	updatedSession.pomodoro.cycles = newBody.cycles;

	return await updateOneCollectionWrapper<Session>(
		sessionId,
		updatedSession as Session,
		client
	);
};
