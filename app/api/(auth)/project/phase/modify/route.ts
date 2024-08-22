import {
	generateMessageResponse,
	generateObjectResponse,
	validate
} from "@/utils/api/api";
import {
	PHASE_COLLECTION,
	Phase,
	StringPhase,
	findCollectionWrapper,
	getCollection,
	updateCollectionWrapper
} from "@/utils/db/db";
import { Collection } from "mongodb";
import { NextRequest } from "next/server";

const requestTemplate = {
	_id: "",
	summary: ""
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

	// Estraiamo l'id dell'utente
	const userId: string = user._id!;

	// Estraiamo l'id dal body
	const phaseId: string = newBody._id!;

	// Otteniamo la collezione delle fasi
	const phaseClient: Collection<Phase> =
		await getCollection<Phase>(PHASE_COLLECTION);

	const phaseOut = await findCollectionWrapper<Phase>(
		{ _id: phaseId },
		phaseClient
	);

	if (phaseOut.status !== 200) {
		return phaseOut;
	}

	const phase: StringPhase[] = await phaseOut.json();

	// Controlliamo che l'owner sia l'utente corrispondente
	if (phase[0].ownerId !== userId) {
		return generateMessageResponse("Unauthorized", 400);
	}

	// Modifichiamo la fase
	const updateOut = await updateCollectionWrapper<Phase>(
		{ _id: phaseId },
		newBody,
		phaseClient
	);

	if (updateOut.status !== 200) {
		return updateOut;
	}

	const updatedPhase: StringPhase = (await updateOut.json())[0];

	return generateObjectResponse(updatedPhase, 200);
};
