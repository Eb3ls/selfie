import { generateMessageResponse } from "@/api_utils/api_functions";
import { ACTIVITY_COLLECTION, getCollection } from "@/db_utils/db_functions";
import {
	deleteCollectionWrapper,
	findCollectionWrapper,
} from "@/db_utils/db_wrappers";
import { Activity, StringActivity } from "@/db_utils/models/Activity";
import { validate } from "@/refactor_utils/refactor_functions";
import { Collection } from "mongodb";
import { NextRequest } from "next/server";

const requestTemplate = {
	_id: "",
};

type RequestType = typeof requestTemplate;

export const DELETE = async (request: NextRequest) => {
	// Validazione della richiesta
	const validation = await validate<RequestType>(
		request,
		requestTemplate,
		false,
	);

	// Se la validazione fallisce, ritorna il messaggio di errore
	if (validation === null) {
		return generateMessageResponse("Invalid request", 400);
	}

	// Estraiamo l'utente e il corpo della richiesta
	const { user: user, body: newBody } = validation;

	// Estraggo l'id dell'utente
	const userId: string = user._id!;

	// Estraggo l'id dal body
	const activityId: string = newBody._id!;

	// Ottieniamo la collezione deglle attività
	const client: Collection<Activity> =
		await getCollection<Activity>(ACTIVITY_COLLECTION);

	const out = await findCollectionWrapper<Activity>(
		{ _id: activityId },
		client,
	);

	if (out.status !== 200) {
		return out;
	}

	const activity: StringActivity[] = await out.json();

	// Controlliamo che l'owner sia l'utente corrispondente
	if (activity[0].ownerId !== userId) {
		return generateMessageResponse("Unauthorized", 400);
	}

	return await deleteCollectionWrapper<Activity>({ _id: activityId }, client);
};
