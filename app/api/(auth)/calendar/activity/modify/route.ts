import { NextRequest } from "next/server";
import { Collection, ObjectId, WithId } from "mongodb";
import {
	parseJSONInput,
	generateMessageResponse,
	isTemplateSubset,
	generateObjectResponse,
	stringsToObjects,
} from "@/api_utils/api_functions";
import {
	getCollection,
	ACTIVITY_COLLECTION,
	updateOneAndFetchInCollection,
} from "@/db_utils/db_functions";
import { Activity } from "@/db_utils/models/Activity";

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
	// Convertiamo in JSON il body della richiesta
	const body: Object | undefined = await parseJSONInput(request);
	if (body === undefined) {
		return generateMessageResponse("Invalid input", 400);
	}

	// Cambio le stringhe date in oggetti Date
	const newBody: any = stringsToObjects(body);

	// Controlliamo che il body abbia tutti i campi necessari
	if (!isTemplateSubset(newBody, requestTemplate, "_id")) {
		return generateMessageResponse("Invalid input", 400);
	}

	// Estraggo l'id dal body
	const id: ObjectId = newBody._id;

	// Creo un oggetto senza il campo id
	const { _id, ...newFields } = newBody;

	// Ottieniamo la collezione delle attività
	const client: Collection<Activity> = await getCollection<Activity>(
		ACTIVITY_COLLECTION
	);

	// Modifichiamo l'attività
	const modifiedActivity: WithId<Activity> | undefined | null =
		await updateOneAndFetchInCollection<Activity>(id, newFields, client);

	if (modifiedActivity === undefined) {
		return generateMessageResponse("Error in database", 400);
	} else if (modifiedActivity === null) {
		return generateMessageResponse("Activity not found", 400);
	}

	return generateObjectResponse(modifiedActivity, 200);
};
