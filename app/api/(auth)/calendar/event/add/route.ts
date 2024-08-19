import { NextRequest } from "next/server";
import { Collection } from "mongodb";
import { getCollection, EVENT_COLLECTION } from "@/db_utils/db_functions";
import { addCollectionWrapper } from "@/db_utils/db_wrappers";
import { Event, createEvent } from "@/db_utils/models/Event";
import {
	generateMessageResponse,
	standardValidation,
} from "@/api_utils/api_functions";

const requestTemplate: Partial<Event> = {
	summary: "",
	description: "",
	status: "",
	rrule: "",
	dtStart: new Date(),
	dtEnd: new Date(),
	categories: [],
	location: "",
	geo: "",
	userIdList: [],
	alarms: [],
};

export const POST = async (request: NextRequest) => {
	// Validazione standard
	const validation = await standardValidation<Event>(
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

	// Creiamo un nuovo evento con quei campi
	const newEvent: Event = createEvent(newBody);

	// Aggiungiamo il campo 'owner' a newEvent
	newEvent.ownerId = owner._id!;
	newEvent.userIdList.push(owner._id!);

	// Ottieniamo la collezione degli eventi
	const client: Collection<Event> = await getCollection<Event>(
		EVENT_COLLECTION
	);

	return await addCollectionWrapper(newEvent, client);
};
