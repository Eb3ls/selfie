import { NextRequest } from "next/server";
import { Collection, ObjectId } from "mongodb";
import {
	getCollection,
	PROJECT_ACTIVITY_COLLECTION,
	NOTE_COLLECTION,
} from "@/db_utils/db_functions";
import {
	findCollectionWrapper,
	deleteCollectionWrapper,
} from "@/db_utils/db_wrappers";
import { ProjectActivity } from "@/db_utils/models/ProjectActivity";
import { Note } from "@/db_utils/models/Note";
import {
	generateMessageResponse,
	standardValidation,
} from "@/api_utils/api_functions";

const requestTemplate: Partial<ProjectActivity> = {
	_id: new ObjectId(),
};

export const DELETE = async (req: NextRequest) => {
	// Validazione standard
	const validation = await standardValidation<ProjectActivity>(
		req,
		requestTemplate,
		true
	);

	// Se la validazione fallisce, ritorna il messaggio di errore
	if (validation === null) {
		return generateMessageResponse("Invalid request", 400);
	}

	// Estraiamo l'utente e il corpo della richiesta
	const { user: user, body: body } = validation;

	// Estraiamo l'utente
	const senderId: ObjectId = user._id!;
	// Estraiamo l'id dell'attività
	const _id: ObjectId = body._id!;

	// Otteniamo la collezione delle attività
	const projectActivityClient: Collection<ProjectActivity> =
		await getCollection<ProjectActivity>(PROJECT_ACTIVITY_COLLECTION);

	const projectActivityOut = await findCollectionWrapper<ProjectActivity>(
		{ _id: _id, ownerId: senderId },
		projectActivityClient
	);

	if (projectActivityOut.status !== 200) {
		return projectActivityOut;
	}

	// Estraiamo i dati dell'attività
	const projectActivityData: ProjectActivity[] =
		await projectActivityOut.json();

	// Otteniamo la collezione delle note
	const noteClient: Collection<Note> = await getCollection<Note>(
		NOTE_COLLECTION
	);

	const noteId = new ObjectId(projectActivityData[0].noteId);

	// Se esiste una nota associata, la eliminiamo
	const noteOut = await deleteCollectionWrapper<Note>(noteId, noteClient);

	console.log(projectActivityData[0].noteId);

	if (noteOut.status !== 200) {
		return noteOut;
	}

	// Eliminiamo l'attività
	return deleteCollectionWrapper<ProjectActivity>(_id, projectActivityClient);
};
