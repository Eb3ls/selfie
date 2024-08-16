import { NextRequest } from "next/server";
import { Collection, ObjectId, WithId } from "mongodb";
import { getSession } from "@/session_utils/session";
import {
	generateMessageResponse,
	parseJSONInput,
	isTemplateValid,
	stringsToObjects,
} from "@/api_utils/api_functions";
import { Activity } from "@/db_utils/models/Activity";
import {
	deleteInCollection,
	ACTIVITY_COLLECTION,
	getCollection,
	findInCollection,
} from "@/db_utils/db_functions";
import { JWTPayload } from "jose";
import { User } from "@/db_utils/models/User";

const requestTemplate: Partial<Activity> = {
	_id: new ObjectId(),
};

export const DELETE = async (request: NextRequest) => {
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

	// Cambio le stringhe che dovrebbero essere oggetti in oggetti
	const newBody: any = stringsToObjects(body);

	// Controlliamo che il body abbia tutti i campi necessari
	if (!isTemplateValid(newBody, requestTemplate)) {
		return generateMessageResponse("Invalid input", 400);
	}

	// Estraggo l'id dal body
	const id: ObjectId = newBody._id;

	// Ottieniamo la collezione degli eventi
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

	// Eliminiamo l'evento
	const result: number | undefined = await deleteInCollection(id, client);

	if (result === undefined) {
		return generateMessageResponse(
			"Error while trying to delete activity",
			400
		);
	}

	if (result === 0) {
		return generateMessageResponse("Activity not found", 400);
	}

	return generateMessageResponse("Activity deleted", 200);
};
