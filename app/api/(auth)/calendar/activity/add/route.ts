import { NextRequest } from "next/server";
import { Collection, ObjectId } from "mongodb";
import { getCollection, ACTIVITY_COLLECTION } from "@/db_utils/db_functions";
import { addCollectionWrapper } from "@/db_utils/db_wrappers";
import { Activity, createActivity } from "@/db_utils/models/Activity";
import { Alarm } from "@/db_utils/models/Alarm";
import {
	generateMessageResponse,
	standardValidation,
} from "@/api_utils/api_functions";

const requestTemplate: Partial<Activity> = {
	summary: "",
	description: "",
	status: "",
	dtStart: new Date(),
	due: new Date(),
	categories: [],
	location: "",
	geo: "",
	parentActivityId: new ObjectId(),
	alarms: [],
};

export const POST = async (request: NextRequest) => {
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
	const { user: owner, body: newBody } = validation;

	// Creiamo una nuova attività con quei campi
	const newActivity: Activity = createActivity(newBody);

	// Aggiungiamo il campo 'owner' a newActivity
	newActivity.ownerId = owner._id!;
	newActivity.userIdList.unshift(owner._id!);

	// Ottieniamo la collezione delle attività
	const client: Collection<Activity> = await getCollection<Activity>(
		ACTIVITY_COLLECTION
	);

	return await addCollectionWrapper(newActivity, client);
};
