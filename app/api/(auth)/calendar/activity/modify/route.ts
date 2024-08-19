import { NextRequest } from "next/server";
import { Collection, ObjectId } from "mongodb";
import { getCollection, ACTIVITY_COLLECTION } from "@/db_utils/db_functions";
import {
	findCollectionWrapper,
	updateOneCollectionWrapper,
} from "@/db_utils/db_wrappers";
import { Activity } from "@/db_utils/models/Activity";
import {
	generateMessageResponse,
	standardValidation,
} from "@/api_utils/api_functions";

const requestTemplate: Partial<Activity> = {
	_id: new ObjectId(),
	summary: "",
	description: "",
	status: "",
	due: new Date(),
	categories: [],
	location: "",
	geo: "",
};

export const PATCH = async (request: NextRequest) => {
	// Validazione standard
	const validation = await standardValidation<Activity>(
		request,
		requestTemplate,
		true,
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

	// Creo un oggetto senza il campo id
	const { _id, ...newFields } = newBody;

	// Ottieniamo la collezione delle attività
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

	// Modifichiamo l'attività
	return await updateOneCollectionWrapper<Activity>(
		activityId,
		newFields as Activity,
		client
	);
};
