import { generateMessageResponse, validate } from "@/utils/api/api";
import {
	ACTIVITY_COLLECTION,
	Activity,
	StringActivity,
	findCollectionWrapper,
	getCollection,
	updateCollectionWrapper
} from "@/utils/db/db";
import { Collection } from "mongodb";
import { NextRequest } from "next/server";

const requestTemplate = {
	_id: "",
	summary: "",
	description: "",
	status: "",
	due: "",
	categories: [],
	location: "",
	geo: ""
};

type RequestType = typeof requestTemplate;

export const PATCH = async (request: NextRequest) => {
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

	// Estraggo l'id dell'utente
	const userId: string = user._id!;

	// Estraggo l'id dal body
	const activityId: string = newBody._id!;

	// Creo un oggetto senza il campo id
	const { _id, ...newFields } = newBody;

	// Ottieniamo la collezione delle attività
	const client: Collection<Activity> =
		await getCollection<Activity>(ACTIVITY_COLLECTION);

	const out = await findCollectionWrapper<Activity>(
		{ _id: activityId },
		client
	);

	if (out.status !== 200) {
		return out;
	}

	const activity: StringActivity[] = await out.json();

	// Controlliamo che l'owner sia l'utente corrispondente
	if (activity[0].ownerId !== userId) {
		return generateMessageResponse("Unauthorized", 400);
	}

	// Modifichiamo l'attività
	return await updateCollectionWrapper<Activity>(
		{ _id: activityId },
		newFields,
		client
	);
};
