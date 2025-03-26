import {
	generateMessageResponse,
	generateStringModel,
	validate
} from "@/utils/api/api";
import {
	NOTE_COLLECTION,
	Note,
	PROJECT_COLLECTION,
	Project,
	StringNote,
	StringProject,
	addCollectionWrapper,
	getCollection
} from "@/utils/db/db";
import { Collection } from "mongodb";
import { NextRequest } from "next/server";

const requestTemplate = {
	summary: ""
};

type RequestType = typeof requestTemplate;

export const POST = async (request: NextRequest) => {
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
	const userId = user._id!;

	// Se il titolo non é tra le 3 e le 50 lettere, ritorna un errore
	if (newBody.summary.length < 3 || newBody.summary.length > 50) {
		return generateMessageResponse("Invalid summary length", 400);
	}

	// Creiamo la nota associata al progetto
	const newNote: StringNote = generateStringModel<StringNote>(
		{
			ownerId: userId,
			summary: newBody.summary,
			categories: "Project",
			access: "INVITED",
			userIdList: [userId]
		},
		"Note"
	);

	// Otteniamo la collezione delle note
	const noteClient: Collection<Note> =
		await getCollection<Note>(NOTE_COLLECTION);

	// Aggiungo la nota al database
	const noteOut = await addCollectionWrapper<Note>(newNote, noteClient);

	if (noteOut.status !== 200) {
		return noteOut;
	}

	const note: StringNote = await noteOut.json();

	// Creiamo un nuovo progetto con quei campi
	const newProject: StringProject = generateStringModel<StringProject>(
		newBody,
		"Project"
	);

	// Aggiungiamo il campo 'ownerId' a newProject
	newProject.ownerId = userId;
	// Aggiungiamo il campo 'noteId' a newProject
	newProject.noteId = note._id!;
	// Inseriamo a 'userIdList' lo user a newProject
	newProject.userIdList = [userId];

	//Otteniamo la collezione dei progetti
	const projectClient: Collection<Project> =
		await getCollection<Project>(PROJECT_COLLECTION);

	return addCollectionWrapper<Project>(newProject, projectClient);
};
