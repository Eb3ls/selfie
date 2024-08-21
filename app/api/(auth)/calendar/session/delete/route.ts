import { generateMessageResponse, validate } from "@/utils/api/api";
import {
	SESSION_COLLECTION,
	Session,
	StringSession,
	deleteCollectionWrapper,
	findCollectionWrapper,
	getCollection
} from "@/utils/db/db";
import { Collection } from "mongodb";
import { NextRequest } from "next/server";

const requestTemplate = {
	_id: ""
};

type RequestType = typeof requestTemplate;

export const DELETE = async (request: NextRequest) => {
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

	// Estraiamo l'id dal body
	const sessionId: string = newBody._id!;

	// Ottieniamo la collezione delle sessioni
	const client: Collection<Session> =
		await getCollection<Session>(SESSION_COLLECTION);

	const out = await findCollectionWrapper<Session>(
		{ _id: sessionId },
		client
	);

	if (out.status !== 200) {
		return out;
	}

	const session: StringSession[] = await out.json();

	// Controlliamo che l'owner sia l'utente corrispondente
	if (session[0].ownerId !== userId) {
		return generateMessageResponse("Unauthorized", 400);
	}

	return await deleteCollectionWrapper<Session>({ _id: sessionId }, client);
};
