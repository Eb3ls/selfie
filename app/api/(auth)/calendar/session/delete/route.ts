import { NextRequest } from "next/server";
import { Collection, ObjectId } from "mongodb";
import { getCollection, SESSION_COLLECTION } from "@/db_utils/db_functions";
import {
	deleteCollectionWrapper,
	findCollectionWrapper,
} from "@/db_utils/db_wrappers";
import { Session } from "@/db_utils/models/Session";
import {
	generateMessageResponse,
	standardValidation,
} from "@/api_utils/api_functions";

const requestTemplate: Partial<Session> = {
	_id: new ObjectId(),
};

export const DELETE = async (request: NextRequest) => {
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
	const { user: user, body: newBody } = validation;

	// Estraggo l'id dell'utente
	const userId: ObjectId = user._id!;

	// Estraggo l'id dal body
	const sessionId: ObjectId = newBody._id!;

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
	if (session[0].ownerId.toString() !== userId.toString()) {
		return generateMessageResponse("Unauthorized", 400);
	}

	return await deleteCollectionWrapper<Session>(sessionId, client);
};
