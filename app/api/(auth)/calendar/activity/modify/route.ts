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
	findInCollection,
} from "@/db_utils/db_functions";
import { Activity } from "@/db_utils/models/Activity";
import { JWTPayload } from "jose";
import { getSession } from "@/session_utils/session";
import { User } from "@/db_utils/models/User";

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
	// Prendiamo i cookie della richiesta
	const cookies: JWTPayload = (await getSession(
		request.cookies
	)) as JWTPayload; // Assumiamo che la sessione sia stata validata dal middleware

	const user: Partial<User> = cookies.user as Partial<User>;
	const userId: any = user._id;
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

	// Controlliamo che l'owner sia l'utente corrispondente
	const activity: WithId<Activity>[] | undefined =
		await findInCollection<Activity>({ _id: id }, client);

	if (activity === undefined) {
		return generateMessageResponse("Error in database", 400);
	} else if (activity.length === 0) {
		return generateMessageResponse("Event not found", 400);
	} else if (activity[0].owner.toString() !== userId.toString()) {
		console.log(activity[0].owner.toString(), userId.toString());
		return generateMessageResponse("Unauthorized", 400);
	}

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
