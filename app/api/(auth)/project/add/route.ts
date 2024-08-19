import { NextRequest } from "next/server";
import { Collection, ObjectId } from "mongodb";
import {
	getCollection,
	PROJECT_COLLECTION,
	NOTE_COLLECTION,
} from "@/db_utils/db_functions";
import { addCollectionWrapper } from "@/db_utils/db_wrappers";
import { Note, createNote } from "@/db_utils/models/Note";
import { Project, createProject } from "@/db_utils/models/Project";
import {
	generateMessageResponse,
	standardValidation,
	getIdFromUsername,
} from "@/api_utils/api_functions";

const requestTemplate: Partial<Project> = {
	summary: "",
	userList: [],
};

export const POST = async (request: NextRequest) => {
	// Validazione standard
	const validation = await standardValidation<Project>(
		request,
		requestTemplate,
		true
	);

	// Se la validazione fallisce, ritorna il messaggio di errore
	if (validation === null) {
		return generateMessageResponse("Invalid request", 400);
	}

	// Estraiamo l'utente e il corpo della richiesta
	const { user: user, body: body } = validation;
	// Prendiamo il senderId
	const senderId: ObjectId = user._id!;

	const usersList = await getIdFromUsername(
		body.userList as unknown as string[],
		senderId
	);

	if (usersList.status !== 200) {
		return usersList;
	}

	const userListData = await usersList.json();
	body.userList = userListData.users.map(
		(user: string) => new ObjectId(user)
	);

	// Creiamo la nota associata al progetto
	const newNote: Note = createNote({
		ownerId: senderId,
		summary: body.summary,
		access: "INVITED",
		userList: body.userList,
	});

	// Otteniamo la collezione delle note
	const noteClient: Collection<Note> = await getCollection<Note>(
		NOTE_COLLECTION
	);

	const noteOut = await addCollectionWrapper<Note>(newNote, noteClient);

	if (noteOut.status !== 200) {
		return noteOut;
	}

	const noteData: Note = await noteOut.json();

	// Creiamo un nuovo progetto con quei campi
	const newProject: Project = createProject(body);

	// Aggiungiamo il campo 'ownerId' a newProject
	newProject.ownerId = senderId; // Assumiamo che la sessione sia corretta
	newProject.noteId = new ObjectId(noteData._id);

	//Otteniamo la collezione dei progetti
	const projectClient: Collection<Project> = await getCollection<Project>(
		PROJECT_COLLECTION
	);

	return addCollectionWrapper<Project>(newProject, projectClient);
};
