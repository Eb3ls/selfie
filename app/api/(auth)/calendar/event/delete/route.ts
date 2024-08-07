import { NextRequest } from "next/server";
import { Collection, ObjectId } from "mongodb";
import { getSession } from "@/session_utils/session";
import {
	generateMessageResponse,
	parseJSONInput,
	isTemplateValid,
} from "@/api_utils/api_functions";
import { Event } from "@/db_utils/models/Event";
import {
	deleteInCollection,
	EVENT_COLLECTION,
	getCollection,
} from "@/db_utils/db_functions";
import { JWTPayload } from "jose";

const requestTemplate = {
	_id: "",
};

export const DELETE = async (request: NextRequest) => {
	// Prendiamo i cookie della richiesta

	const cookies: JWTPayload = (await getSession(
		request.cookies
	)) as JWTPayload; // Assumiamo che la sessione sia stata validata dal middleware

	// Convertiamo in JSON il body della richiesta
	const body: Object | undefined = await parseJSONInput(request);
	if (body === undefined) {
		return generateMessageResponse("Invalid input", 400);
	}

	// Controlliamo che il body abbia tutti i campi necessari
	if (!isTemplateValid(body, requestTemplate)) {
		return generateMessageResponse("Invalid input", 400);
	}

	// Estraggo l'id dal body
	const stringId: string = JSON.parse(JSON.stringify(body))._id;
	const id: ObjectId = ObjectId.createFromHexString(stringId);

	// Ottieniamo la collezione degli eventi
	const client: Collection<Event> = await getCollection<Event>(
		EVENT_COLLECTION
	);

	// Eliminiamo l'evento
	const result: number | undefined = await deleteInCollection(id, client);

	if (result === undefined) {
		return generateMessageResponse(
			"Error while trying to delete event",
			400
		);
	}

	return generateMessageResponse("Event deleted", 200);
};
