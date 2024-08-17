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
	isTemplateSubset,
	generateMessageResponse,
	generateObjectResponse,
	getIdFromUsername,
} from "@/api_utils/api_functions";
import { getSession } from "@/session_utils/session";
import { JWTPayload } from "jose";

const requestTemplate: Object = {
	_id: new ObjectId(),
	summary: "",
	access: "",
	userList: [],
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
	if (!isTemplateSubset(body, requestTemplate, "_id")) {
		return generateMessageResponse("Invalid input", 400);
	}

	if (body.userList !== undefined) {
		// Otteniamo la lista degli id degli utenti
		const parsedUsers = await getIdFromUsername(body.userList, senderId);

		// Ritorniamo la lista di utenti sbagliati o errore nel db
		if (parsedUsers.status !== 200) {
			return parsedUsers;
		}

		const usersList: ObjectId[] = await parsedUsers.json();
		body.userList = usersList;
	}

	// Creo un oggetto senza il campo id
	const { _id, ...newFields } = body;

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

	// Controlliamo che il sender sia l'owner
	if (!queryOut[0].ownerId.equals(senderId)) {
		return generateMessageResponse("Sender isn't the owner", 400);
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
