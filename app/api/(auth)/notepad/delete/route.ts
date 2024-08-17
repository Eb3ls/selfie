import { NextRequest } from "next/server";
import { Collection, ObjectId, WithId } from "mongodb";
import {
	getCollection,
	NOTE_COLLECTION,
	findInCollection,
	deleteInCollection,
} from "@/db_utils/db_functions";

import { User } from "@/db_utils/models/User";
import { Note } from "@/db_utils/models/Note";
import {
	parseJSONInput,
	isTemplateValid,
	generateMessageResponse,
} from "@/api_utils/api_functions";
import { getSession } from "@/session_utils/session";
import { JWTPayload } from "jose";

const requestTemplate: Object = {
	_id: new ObjectId(),
};

export const DELETE = async (request: NextRequest) => {
	// Prendiamo i cookie della richiesta
	const cookies: JWTPayload = (await getSession(
		request.cookies
	)) as JWTPayload; // Assumiamo che la sessione sia stata validata dal middleware

	const sender: Partial<User> = cookies.user as Partial<User>;
	// Prendiamo l'id dell'utente che vuole creare la chat seguendo l'assunzione
	const senderId: ObjectId = ObjectId.createFromHexString(sender._id! as any);

	// Convertiamo in JSON il body della richiesta
	const body: any | undefined = await parseJSONInput(request);
	if (body === undefined) {
		return generateMessageResponse("Invalid input", 400);
	}

	// body._id da stringa a ObjectId
	body._id = ObjectId.createFromHexString(body._id);

	// Controlliamo che il body abbia tutti i campi necessari
	if (!isTemplateValid(body, requestTemplate)) {
		return generateMessageResponse("Invalid input", 400);
	}

	// Estraggo l'id dal body
	const id: ObjectId = body._id;

	// Ottieniamo la collezione delle note
	const client: Collection<Note> = await getCollection<Note>(NOTE_COLLECTION);

	// Troviamo la nota da eliminare
	const queryOut: WithId<Note>[] | undefined = await findInCollection(
		id,
		client
	);

	// Controlliamo che il sender sia l'owner
	if (queryOut === undefined) {
		return generateMessageResponse("Error in database", 400);
	} else if (queryOut.length === 0) {
		return generateMessageResponse("Note not found", 400);
	} else if (!queryOut[0].ownerId.equals(senderId)) {
		return generateMessageResponse("Sender isn't the owner", 400);
	}

	// Eliminiamo la nota
	const result: number | undefined = await deleteInCollection(id, client);
	if (result === undefined) {
		return generateMessageResponse("Error while deleting", 400);
	}

	return generateMessageResponse("Note deleted", 200);
};
