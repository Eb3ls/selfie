import { NextRequest } from "next/server";
import { Collection, WithId, ObjectId } from "mongodb";
import {
	getCollection,
	EVENT_COLLECTION,
	addAndFetchToCollection,
} from "@/db_utils/db_functions";

import { createEvent, Event } from "@/db_utils/models/Event";
import {
	parseJSONInput,
	generateMessageResponse,
	isTemplateValid,
	generateObjectResponse,
} from "@/api_utils/api_functions";
import { getSession } from "@/session_utils/session";
import { JWTPayload } from "jose";
import { User } from "@/db_utils/models/User";

const requestTemplate: Partial<Event> = {
	summary: "",
	description: "",
	status: 0,
	rrule: "",
	dtStart: new Date(),
	dtEnd: new Date(),
	dtStamp: new Date(),
	categories: [],
	location: "",
	geo: "",
	userList: [],
	alarms: [],
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

	// Controlliamo che il body abbia tutti i campi necessari
	if (!isTemplateValid(body, requestTemplate)) {
		return generateMessageResponse("Invalid input", 400);
	}

	// Creiamo un nuovo evento con quei campi
	const newEvent: Event = createEvent(body);

	// Aggiungiamo il campo 'owner' a newEvent
	newEvent.owner = owner._id as ObjectId; // Assumiamo che la sessione sia corretta
	newEvent.userList.push(owner._id as ObjectId);

	// Ottieniamo la collezione degli eventi
	const client: Collection<Event> = await getCollection<Event>(
		EVENT_COLLECTION
	);

	// Aggiungi il nuovo evento al db
	const insertedEvent: WithId<Event> | null | undefined =
		await addAndFetchToCollection<Event>(newEvent, client);
	if (insertedEvent === undefined) {
		return generateMessageResponse("Error with DB connection", 400);
	} else if (insertedEvent === null) {
		return generateMessageResponse(
			"Error while trying to add event (Should never happen)",
			400
		);
	}

	return generateObjectResponse(insertedEvent, 200);
};
