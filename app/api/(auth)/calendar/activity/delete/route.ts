import { NextRequest } from "next/server";
import { Collection, ObjectId } from "mongodb";
import { getCollection, ACTIVITY_COLLECTION } from "@/db_utils/db_functions";
import {
	deleteCollectionWrapper,
	findCollectionWrapper,
} from "@/db_utils/db_wrappers";
import { Activity } from "@/db_utils/models/Activity";
import {
	generateMessageResponse,
	standardValidation,
} from "@/api_utils/api_functions";

const requestTemplate: Partial<Activity> = {
	_id: new ObjectId(),
};

export const DELETE = async (request: NextRequest) => {
	// Validazione standard
	const validation = await standardValidation<Activity>(
		request,
		requestTemplate,
		true
	);

	// Se la validazione fallisce, ritorna il messaggio di errore
	if (validation === null) {
		return generateMessageResponse("Invalid request", 400);
	}

	// Estraiamo l'utente e il corpo della richiesta
	const { user: user, body: newBody } = validation;

	// Estraggo l'id dell'utente
	const userId: ObjectId = user._id!;

	// Estraggo l'id dal body
	const activityId: ObjectId = newBody._id!;

	// Ottieniamo la collezione deglle attività
	const client: Collection<Activity> = await getCollection<Activity>(
		ACTIVITY_COLLECTION
	);

	const out = await findCollectionWrapper<Activity>(
		{ _id: activityId },
		client
	);

	if (out.status !== 200) {
		return out;
	}

	const activity: Activity[] = await out.json();

	// Controlliamo che l'owner sia l'utente corrispondente
	if (activity[0].ownerId.toString() !== userId.toString()) {
		return generateMessageResponse("Unauthorized", 400);
	}

	return await deleteCollectionWrapper<Activity>(activityId, client);
};
