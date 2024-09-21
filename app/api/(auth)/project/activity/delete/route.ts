import { generateMessageResponse, validate } from "@/utils/api/api";
import { deleteProjectActivity } from "@/utils/api/api";
import {
	NOTE_COLLECTION,
	Note,
	PROJECT_ACTIVITY_COLLECTION,
	ProjectActivity,
	StringProjectActivity,
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
	const activityId: string = newBody._id!;

	// Otteniamo la collezione delle attività
	const projectActivityClient: Collection<ProjectActivity> =
		await getCollection<ProjectActivity>(PROJECT_ACTIVITY_COLLECTION);

	// Otteniamo la collezione delle note
	const noteClient: Collection<Note> =
		await getCollection<Note>(NOTE_COLLECTION);

	const projectActivityOut = await findCollectionWrapper<ProjectActivity>(
		{ _id: activityId },
		projectActivityClient
	);

	if (projectActivityOut.status !== 200) {
		return projectActivityOut;
	}

	const projectActivity: StringProjectActivity[] =
		await projectActivityOut.json();

	// Controlliamo che l'owner sia l'utente corrispondente
	if (projectActivity[0].ownerId !== userId) {
		return generateMessageResponse("Unauthorized", 400);
	}

	return await deleteProjectActivity(
		projectActivity[0],
		projectActivityClient,
		noteClient
	);
};
