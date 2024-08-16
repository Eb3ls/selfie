import { Activity, createActivity } from "@/db_utils/models/Activity";
import { Alarm } from "@/db_utils/models/Alarm";
import { User } from "@/db_utils/models/User";
import { NextRequest } from "next/server";
import { Collection, ObjectId, WithId } from "mongodb";
import { getSession } from "@/session_utils/session";
import {
	parseJSONInput,
	generateMessageResponse,
	isTemplateValid,
	generateObjectResponse,
	stringsToObjects,
} from "@/api_utils/api_functions";
import { JWTPayload } from "jose";
import {
	ACTIVITY_COLLECTION,
	getCollection,
	addAndFetchToCollection,
} from "@/db_utils/db_functions";

const requestTemplate: Partial<Activity> = {
	summary: "",
	description: "",
	status: "",
	dtStart: new Date(),
	due: new Date(),
	dtStamp: new Date(),
	categories: [],
	location: "",
	geo: "",
	parentActivity: new ObjectId(),
	alarms: [] as Alarm[],
};

export const POST = async (request: NextRequest) => {
	// Prendiamo i cookie della richiesta
	const cookies: JWTPayload = (await getSession(
		request.cookies
	)) as JWTPayload; // Assumiamo che la sessione sia stata validata dal middleware

	const owner: Partial<User> = cookies.user as Partial<User>;

	// Convertiamo in JSON il body della richiesta
	const body: Object | undefined = await parseJSONInput(request);
	if (body === undefined) {
		return generateMessageResponse("Invalid input", 400);
	}

	// Cambio le stringhe date in oggetti Date
	const newBody: any = stringsToObjects(body);

	// Controlliamo che il body abbia tutti i campi necessari
	if (!isTemplateValid(newBody, requestTemplate)) {
		return generateMessageResponse("Invalid input", 400);
	}

	// Creiamo una nuova attività con quei campi
	const newActivity: Activity = createActivity(newBody);

	// Aggiungiamo il campo 'owner' a newActivity
	newActivity.owner = owner._id as ObjectId; // Assumiamo che la sessione sia corretta
	newActivity.userList.push(owner._id as ObjectId);

	// Ottieniamo la collezione delle attività
	const client: Collection<Activity> = await getCollection<Activity>(
		ACTIVITY_COLLECTION
	);

	// Aggiungiamo l'attività al db
	const insertedActivity: WithId<Activity> | undefined | null =
		await addAndFetchToCollection<Activity>(newActivity, client);
	if (insertedActivity === undefined) {
		return generateMessageResponse("Error with DB connection", 400);
	} else if (insertedActivity === null) {
		return generateMessageResponse(
			"Error while trying to add activity",
			400
		);
	}

	return generateObjectResponse(insertedActivity, 200);
};
