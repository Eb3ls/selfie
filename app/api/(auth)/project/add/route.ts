import { NextRequest } from "next/server";
import { Collection, WithId, ObjectId } from "mongodb";
import {
	getCollection,
	USER_COLLECTION,
	NOTE_COLLECTION,
	PROJECT_COLLECTION,
	findInCollection,
	addAndFetchToCollection,
} from "@/db_utils/db_functions";

import { User } from "@/db_utils/models/User";
import { Note, createNote } from "@/db_utils/models/Note";
import { Project, createProject } from "@/db_utils/models/Project";
import {
	parseJSONInput,
	isTemplateValid,
	generateMessageResponse,
	generateObjectResponse,
} from "@/api_utils/api_functions";
import { getSession } from "@/session_utils/session";
import { JWTPayload } from "jose";

const requestTemplate: Partial<Project> = {
	summary: "",
	userList: [],
};

export const POST = async (request: NextRequest) => {
	// Prendiamo i cookie della richiesta
	const cookies: JWTPayload = (await getSession(
		request.cookies
	)) as JWTPayload; // Assumiamo che la sessione sia stata validata dal middleware;

	const sender: Partial<User> = cookies.user as Partial<User>;
	// Prendiamo l'id dell'utente che vuole creare il progetto seguendo l'assunzione
	const senderId: ObjectId = ObjectId.createFromHexString(sender._id! as any);

	// Convertiamo in JSON il body della richiesta
	const body: any | undefined = await parseJSONInput(request);
	if (body === undefined) {
		return generateMessageResponse("Invalid input", 400);
	}

	// Controlliamo che il body abbia tutti i campi necessari
	if (!isTemplateValid(body, requestTemplate)) {
		return generateMessageResponse("Invalid input", 400);
	}

	// Iteriamo su userList per convertire ogni username in un ObjectId
	const userList: ObjectId[] = [];

	const client: Collection<User> = await getCollection<User>(USER_COLLECTION);

	for (const username of body.userList) {
		// Controlliamo che l'utente esista
		const queryOut: WithId<User>[] | undefined =
			await findInCollection<User>({ username: username }, client);

		// Se l'utente non esiste, restituiamo un messaggio di errore
		if (queryOut === undefined) {
			return generateMessageResponse("Error in database", 404);
		} else if (queryOut.length === 0) {
			return generateMessageResponse("User not found", 404);
		}
		userList.push(queryOut[0]._id);
	}

	// Inseriamo gli id degli user all'interno di body
	body.userList = userList;
	body.userList.unshift(senderId);

	// Creiamo l'oggetto da cui deriverà la nota
	const obj: Partial<Note> = {
		ownerId: senderId,
		summary: body.summary,
		access: "PRIVATE",
		userList: body.userList,
	};

	// Creiamo la nota associata al progetto
	const newNote: Note = createNote(obj);

	// Otteniamo la collezione delle note
	const noteClient: Collection<Note> = await getCollection<Note>(
		NOTE_COLLECTION
	);

	// Aggiungiamo la nuova nota al db
	const insertedNote: WithId<Note> | null | undefined =
		await addAndFetchToCollection<Note>(newNote, noteClient);
	if (insertedNote === undefined) {
		return generateMessageResponse("Error with DB connection", 400);
	} else if (insertedNote === null) {
		return generateMessageResponse(
			"Error while trying to add note (Should never happen)",
			400
		);
	}

	// Creiamo un nuovo progetto con quei campi
	const newProject: Project = createProject(body);

	// Aggiungiamo il campo 'ownerId' a newProject
	newProject.ownerId = senderId; // Assumiamo che la sessione sia corretta
	newProject.note = insertedNote._id;

	//Otteniamo la collezione dei progetti
	const projectClient: Collection<Project> = await getCollection<Project>(
		PROJECT_COLLECTION
	);

	// Aggiungiamo il nuovo progetto al db
	const insertedProject: WithId<Project> | null | undefined =
		await addAndFetchToCollection<Project>(newProject, projectClient);
	if (insertedProject === undefined) {
		return generateMessageResponse("Error with DB connection", 400);
	} else if (insertedProject === null) {
		return generateMessageResponse(
			"Error while trying to add project (Should never happen)",
			400
		);
	}

	return generateObjectResponse(insertedProject, 200);
};
