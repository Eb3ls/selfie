import { NextRequest } from "next/server";
import { Collection, ObjectId } from "mongodb";
import {
	getCollection,
	PROJECT_COLLECTION,
	NOTE_COLLECTION,
} from "@/db_utils/db_functions";
import {
	findCollectionWrapper,
	deleteCollectionWrapper,
} from "@/db_utils/db_wrappers";
import { Note } from "@/db_utils/models/Note";
import { Project } from "@/db_utils/models/Project";
import {
	generateMessageResponse,
	standardValidation,
} from "@/api_utils/api_functions";

const requestTemplate: Partial<Project> = {
	_id: new ObjectId(),
};

export const DELETE = async (request: NextRequest) => {
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

	// Estraggo l'id dal body
	const id: ObjectId = body._id!;

	// Otteniamo la collezione dei progetti
	const projectClient: Collection<Project> = await getCollection<Project>(
		PROJECT_COLLECTION
	);

	// Cerchiamo il progetto
	const projectQueryOut = await findCollectionWrapper<Project>(
		{ _id: id, ownerId: senderId },
		projectClient
	);

	// Se non esiste il progetto
	if (projectQueryOut.status !== 200) {
		return projectQueryOut;
	}

	const noteData: Note = (await projectQueryOut.json())[0];

	// Ottieniamo la collezione delle note
	const noteClient: Collection<Note> = await getCollection<Note>(
		NOTE_COLLECTION
	);

	// Eliminiamo la nota associata al progetto
	const noteQueryOut = await deleteCollectionWrapper<Note>(
		new ObjectId(noteData._id),
		noteClient
	);

	// Se non esiste la nota
	if (noteQueryOut.status !== 200) {
		return noteQueryOut;
	}

	// Eliminiamo il progetto
	return deleteCollectionWrapper<Project>(id, projectClient);

	// TODO eliminare le note associate alle projectActivity
};
