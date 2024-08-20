import { generateMessageResponse } from "@/api_utils/api_functions";
import { ACTIVITY_COLLECTION, getCollection } from "@/db_utils/db_functions";
import { addCollectionWrapper } from "@/db_utils/db_wrappers";
import {
	Activity,
	StringActivity,
	createActivity,
} from "@/db_utils/models/Activity";
import {
	fromModelToStringModel,
	stringsToObjectId,
	validate,
} from "@/refactor_utils/refactor_functions";
import { Collection } from "mongodb";
import { NextRequest } from "next/server";

const requestTemplate = {
	summary: "",
	description: "",
	status: "",
	dtStart: "",
	due: "",
	categories: [],
	location: "",
	geo: "",
	parentActivityId: "",
	alarms: [],
};

type RequestType = typeof requestTemplate;

export const POST = async (request: NextRequest) => {
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
	const { user: owner, body: newBody } = validation;

	// Creiamo una nuova attività con quei campi
	const newActivity: StringActivity = fromModelToStringModel(
		createActivity(stringsToObjectId(newBody)),
	);

	// Aggiungiamo il campo 'owner' a newActivity
	newActivity.ownerId = owner._id!;
	newActivity.userIdList.unshift(owner._id!);

	// Ottieniamo la collezione delle attività
	const client: Collection<Activity> =
		await getCollection<Activity>(ACTIVITY_COLLECTION);

	return await addCollectionWrapper(newActivity, client);
};
