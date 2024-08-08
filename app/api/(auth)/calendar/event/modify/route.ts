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
	EVENT_COLLECTION,
	updateOneAndFetchInCollection,
} from "@/db_utils/db_functions";
import { Event } from "@/db_utils/models/Event";

const requestTemplate: Partial<Event> = {
	_id: new ObjectId(),
	summary: "",
	description: "",
	status: "",
	dtStart: new Date(),
	dtEnd: new Date(),
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

	// Cambio le stringhe che dovrebbero essere oggetti in oggetti
	const newBody: any = stringsToObjects(body);

	// Controlliamo che il body abbia tutti i campi necessari
	if (!isTemplateSubset(newBody, requestTemplate, "_id")) {
		return generateMessageResponse("Invalid input", 400);
	}

	// Estraggo l'id dal body
	const id: ObjectId = newBody._id;

	// Creo un oggetto senza il campo id
	const { _id, ...newFields } = newBody;

	// Ottieniamo la collezione degli eventi
	const client: Collection<Event> = await getCollection<Event>(
		EVENT_COLLECTION
	);

	// Modifichiamo l'evento
	const modifiedEvent: WithId<Event> | undefined | null =
		await updateOneAndFetchInCollection<Event>(id, newFields, client);

	if (modifiedEvent === undefined) {
		return generateMessageResponse("Error in database", 400);
	} else if (modifiedEvent === null) {
		return generateMessageResponse("Event not found", 400);
	}

	return generateObjectResponse(modifiedEvent, 200);
};
