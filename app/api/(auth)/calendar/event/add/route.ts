import {
	generateMessageResponse,
	generateStringModel,
	validate
} from "@/utils/api/api";
import {
	EVENT_COLLECTION,
	Event,
	StringEvent,
	addCollectionWrapper,
	createEvent,
	getCollection
} from "@/utils/db/db";
import { Collection } from "mongodb";
import { NextRequest } from "next/server";

const requestTemplate = {
	summary: "",
	description: "",
	status: "",
	rrule: "",
	dtStart: "",
	dtEnd: "",
	categories: [],
	location: "",
	geo: "",
	userIdList: [],
	alarms: []
};

type RequestType = typeof requestTemplate;

export const POST = async (request: NextRequest) => {
	// Validazione della richiesta
	const validation = await validate<RequestType>(
		request,
		requestTemplate,
		false
	);

	// Se la validazione fallisce, ritorna il messaggio di errore
	if (validation === null) {
		return generateMessageResponse("Invalid request", 400);
	}

	// Estraiamo l'utente e il corpo della richiesta
	const { user: owner, body: newBody } = validation;

	// Creiamo un nuovo evento con quei campi
	const newEvent: StringEvent = generateStringModel<StringEvent>(
		newBody,
		"Event"
	);

	// Aggiungiamo il campo 'owner' a newEvent
	newEvent.ownerId = owner._id!;
	newEvent.userIdList.push(owner._id!);

	// Ottieniamo la collezione degli eventi
	const client: Collection<Event> =
		await getCollection<Event>(EVENT_COLLECTION);

	return await addCollectionWrapper(newEvent, client);
};
