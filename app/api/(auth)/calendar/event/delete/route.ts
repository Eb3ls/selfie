import { NextRequest } from "next/server";
import { Collection, ObjectId } from "mongodb";
import { getCollection, EVENT_COLLECTION } from "@/db_utils/db_functions";
import {
	deleteCollectionWrapper,
	findCollectionWrapper,
} from "@/db_utils/db_wrappers";
import { Event } from "@/db_utils/models/Event";
import {
	generateMessageResponse,
	standardValidation,
} from "@/api_utils/api_functions";

const requestTemplate: Partial<Event> = {
	_id: new ObjectId(),
};

export const DELETE = async (request: NextRequest) => {
	// Validazione standard
	const validation = await standardValidation<Event>(
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
	const eventId: ObjectId = newBody._id!;

	// Ottieniamo la collezione degli eventi
	const client: Collection<Event> = await getCollection<Event>(
		EVENT_COLLECTION
	);

	const out = await findCollectionWrapper<Event>({ _id: eventId }, client);

	if (out.status !== 200) {
		return out;
	}

	const event: Event[] = await out.json();

	// Controlliamo che l'owner sia l'utente corrispondente
	if (event[0].ownerId.toString() !== userId.toString()) {
		return generateMessageResponse("Unauthorized", 400);
	}

	return await deleteCollectionWrapper<Event>(eventId, client);
};
