import { generateMessageResponse, validate } from "@/utils/api/api";
import {
	EVENT_COLLECTION,
	Event,
	StringEvent,
	findCollectionWrapper,
	getCollection,
	updateCollectionWrapper
} from "@/utils/db/db";
import { Collection, ObjectId } from "mongodb";
import { NextRequest } from "next/server";

const requestTemplate = {
	_id: ""
};

type RequestType = typeof requestTemplate;

export const POST = async (
	request: NextRequest,
	{ params }: { params: { id: string } }
) => {
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
	const { user: user, body: newBody } = validation;

	// Controlliamo che l'utente sia admin
	if (user.username !== "admin") {
		return generateMessageResponse("You are not admin", 403);
	}

	// Otteniamo l'ID della risorsa dall'URL
	if (!ObjectId.isValid(params.id)) {
		return generateMessageResponse("Invalid resource ID", 400);
	}
	const resourceId: string = params.id;

	// Estraiamo l'id dell'evento
	const eventId: string = newBody._id;

	// Ottieniamo la collezione degli eventi
	const client: Collection<Event> =
		await getCollection<Event>(EVENT_COLLECTION);

	// Cerchiamo l'evento
	const out = await findCollectionWrapper<Event>({ _id: eventId }, client);

	if (out.status !== 200) {
		return out;
	}

	const event: StringEvent = (await out.json())[0];

	// Controlliamo che l'utente che ha fatto la richiesta non sia l'owner
	if (event.ownerId === resourceId) {
		return generateMessageResponse("You cannot quit your own event", 400);
	}

	// Controlliamo che l'utente sia presente nella lista degli utenti
	if (!event.userIdList.includes(resourceId)) {
		return generateMessageResponse("You are not in the event", 400);
	}

	// Rimuoviamo l'utente dalla lista degli utenti
	const newUserIdList = event.userIdList.filter(
		(userIdList) => userIdList !== resourceId
	);

	// Modifichiamo l'evento
	const updateOut = await updateCollectionWrapper<Event>(
		{ _id: eventId },
		{ $set: { userIdList: newUserIdList } } as any,
		client
	);

	if (updateOut.status !== 200) {
		return updateOut;
	}

	// Se siamo arrivati qui, la richiesta è andata a buon fine
	return generateMessageResponse("Operation completed", 200);
};
