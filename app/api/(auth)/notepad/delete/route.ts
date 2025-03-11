import { generateMessageResponse, validate } from "@/utils/api/api";
import {
	NOTE_COLLECTION,
	Note,
	PROJECT_ACTIVITY_COLLECTION,
	PROJECT_COLLECTION,
	Project,
	ProjectActivity,
	StringNote,
	deleteCollectionWrapper,
	findCollectionWrapper,
	getCollection
} from "@/utils/db/db";
import { Collection } from "mongodb";
import { NextRequest } from "next/server";

const requestTemplate = {
	_id: ""
};

type RequestType = typeof requestTemplate;

export const DELETE = async (request: NextRequest) => {
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
	const userId: string = user._id!;

	// Estraiamo l'id dal body
	const noteId: string = newBody._id!;

	// Otteniamo la collezione dei progetti
	const projectClient: Collection<Project> =
		await getCollection<Project>(PROJECT_COLLECTION);

	// Controlliamo che la nota non sia associata ad un progetto
	const outProject = await findCollectionWrapper<Project>(
		{ noteId: noteId },
		projectClient
	);

	if (outProject.status === 500) {
		return outProject;
	} else if (outProject.status === 200) {
		return generateMessageResponse(
			"Note is associated with a project",
			401
		);
	}

	// Controlliamo che la nota non sia associata a una project activity
	const projectActivityClient: Collection<ProjectActivity> =
		await getCollection<ProjectActivity>(PROJECT_ACTIVITY_COLLECTION);

	const outProjectActivity = await findCollectionWrapper<ProjectActivity>(
		{ noteId: noteId },
		projectActivityClient
	);

	if (outProjectActivity.status === 500) {
		return outProjectActivity;
	} else if (outProjectActivity.status === 200) {
		return generateMessageResponse(
			"Note is associated with a project activity",
			401
		);
	}

	// Se arriviamo qui, la nota non è associata ad un progetto o ad una project activity

	// Ottieniamo la collezione delle note
	const noteClient: Collection<Note> =
		await getCollection<Note>(NOTE_COLLECTION);

	const outNote = await findCollectionWrapper<Note>(
		{ _id: noteId },
		noteClient
	);

	if (outNote.status !== 200) {
		return outNote;
	}

	const note: StringNote[] = await outNote.json();

	// Controlliamo che l'owner sia l'utente corrispondente
	if (note[0].ownerId !== userId) {
		return generateMessageResponse("Unauthorized", 400);
	}

	return await deleteCollectionWrapper<Note>({ _id: noteId }, noteClient);
};
