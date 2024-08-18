import { NextRequest } from "next/server";
import { Collection, ObjectId, WithId } from "mongodb";
import {
	getCollection,
	NOTE_COLLECTION,
	findInCollection,
	updateOneAndFetchInCollection,
} from "@/db_utils/db_functions";

import { User } from "@/db_utils/models/User";
import { Note } from "@/db_utils/models/Note";
import {
	parseJSONInput,
	isTemplateValid,
	generateMessageResponse,
	generateObjectResponse,
} from "@/api_utils/api_functions";
import { getSession } from "@/session_utils/session";
import { JWTPayload } from "jose";

const requestTemplate: Partial<Note> = {
	_id: new ObjectId(),
	text: "",
};

export const PATCH = async (request: NextRequest) => {
	// Prendiamo i cookie della richiesta
	const cookies: JWTPayload = (await getSession(
		request.cookies
	)) as JWTPayload; // Assumiamo che la sessione sia stata validata dal middleware

	const sender: Partial<User> = cookies.user as Partial<User>;
	// Prendiamo l'id dell'utente che vuole modificare la nota seguendo l'assunzione
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

	// Creo un oggetto senza il campo id
	const { _id, ...newFields } = body;

	// Aggiorniamo la lunghezza della nota
	newFields.length = newFields.text.length;

	// Ottieniamo la collezione delle note
	const client: Collection<Note> = await getCollection<Note>(NOTE_COLLECTION);

	// Controlliamo che la nota esista
	const queryOut: WithId<Note>[] | undefined = await findInCollection(
		{ _id: _id },
		client
	);

	if (queryOut === undefined) {
		return generateMessageResponse("Error in database", 400);
	} else if (queryOut.length === 0) {
		return generateMessageResponse("Note not found", 400);
	}

	const isInvited: boolean =
		queryOut[0].access === "INVITED" &&
		queryOut[0].userList.includes(senderId);
	const isCreator: boolean = queryOut[0].ownerId.equals(senderId);
	const isPublic: boolean = queryOut[0].access === "PUBLIC";

	// Controlliamo che il sender abbia accesso
	if (!isInvited && !isCreator && !isPublic) {
		return generateMessageResponse("Sender doesn't have access", 400);
	}

	// Modifichiamo la nota
	const modifiedNote: WithId<Note> | undefined | null =
		await updateOneAndFetchInCollection(_id, newFields, client);
	if (modifiedNote === undefined) {
		return generateMessageResponse("Error in database", 400);
	} else if (modifiedNote === null) {
		return generateMessageResponse("Note not found", 400);
	}
	return generateObjectResponse(modifiedNote, 200);
};
