import {
	generateMessageResponse,
	removeInvitations,
	validate
} from "@/utils/api/api";
import {
	ACTIVITY_COLLECTION,
	Activity,
	StringActivity,
	deleteCollectionWrapper,
	findCollectionWrapper,
	getCollection
} from "@/utils/db/db";
import { Collection } from "mongodb";
import { NextRequest } from "next/server";

const requestTemplate = {
	_id: ""
};

type RequestType = typeof requestTemplate;

export const DELETE = async (request: NextRequest) => {
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

	// Estraiamo l'id dell'utente
	const userId: string = user._id!;

	// Estraiamo l'id dal body
	const activityId: string = newBody._id!;

	// Ottieniamo la collezione deglle attività
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

	// Rimuoviamo gli inviti associati all'attività
	const inviteOut = await removeInvitations("ACTIVITY", activityId);

	if (inviteOut.status !== 200) {
		return inviteOut;
	}

	return await deleteCollectionWrapper<Activity>({ _id: activityId }, client);
};
