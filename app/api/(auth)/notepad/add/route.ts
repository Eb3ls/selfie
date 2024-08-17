import { NextRequest } from "next/server";
import { Collection, ObjectId, WithId } from "mongodb";
import {
	getCollection,
	NOTE_COLLECTION,
	addAndFetchToCollection,
} from "@/db_utils/db_functions";

import { User } from "@/db_utils/models/User";
import { Note, createNote } from "@/db_utils/models/Note";
import {
	parseJSONInput,
	generateMessageResponse,
	generateObjectResponse,
	getIdFromUsername,
	isTemplateSubset,
} from "@/api_utils/api_functions";
import { getSession } from "@/session_utils/session";
import { JWTPayload } from "jose";

const requestTemplate: Partial<Note> = {
	access: "",
	userList: [],
};

export const POST = async (request: NextRequest) => {
	// Prendiamo i cookie della richiesta
	const cookies: JWTPayload = (await getSession(
		request.cookies
	)) as JWTPayload; // Assumiamo che la sessione sia stata validata dal middleware

	const sender: Partial<User> = cookies.user as Partial<User>;
	// Prendiamo l'id dell'utente che vuole creare la nota seguendo l'assunzione
	const senderId: ObjectId = ObjectId.createFromHexString(sender._id! as any);

	// Convertiamo in JSON il body della richiesta
	const body: any | undefined = await parseJSONInput(request);
	if (body === undefined) {
		return generateMessageResponse("Invalid input", 400);
	}

	// Controlliamo che il body abbia tutti i campi necessari
	if (!isTemplateSubset(body, requestTemplate, "access")) {
		return generateMessageResponse("Invalid input", 400);
	} else if (
		body.access !== "PRIVATE" &&
		body.access !== "INVITED" &&
		body.access !== "PUBLIC"
	) {
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
	} else {
		body.userList = [senderId];
	}

	// Creiamo una nuova nota con quei campi
	const newNote: Note = createNote(body);

	// Aggiungiamo il campo 'ownerId' a newNote
	newNote.ownerId = senderId; // Assumiamo che la sessione sia corretta
	newNote.summary = "Nota";

	// Ottieniamo la collezione delle note
	const noteClient: Collection<Note> = await getCollection<Note>(
		NOTE_COLLECTION
	);

	// Aggiungiamo il nuovo evento al db
	const insertedNote: WithId<Note> | null | undefined =
		await addAndFetchToCollection(newNote, noteClient);
	if (insertedNote === undefined) {
		return generateMessageResponse("Error in database", 400);
	} else if (insertedNote === null) {
		return generateMessageResponse(
			"Error while trying to add note (Should never happen)",
			400
		);
	}

	return generateObjectResponse(insertedNote, 200);
};
