import { NextRequest } from "next/server";
import { Collection, ObjectId } from "mongodb";
import { getCollection, PHASE_COLLECTION } from "@/db_utils/db_functions";
import {
	findCollectionWrapper,
	updateOneCollectionWrapper,
} from "@/db_utils/db_wrappers";
import { Phase } from "@/db_utils/models/Phase";
import {
	generateMessageResponse,
	standardValidation,
} from "@/api_utils/api_functions";

const requestTemplate: Partial<Phase> = {
	_id: new ObjectId(),
	summary: "",
};

export const PATCH = async (request: NextRequest) => {
	// Validazione standard
	const validation = await standardValidation<Phase>(
		request,
		requestTemplate,
		true
	);

	// Se la validazione fallisce, ritorna il messaggio di errore
	if (validation === null) {
		return generateMessageResponse("Invalid request", 400);
	}

	// Estraiamo l'utente e il corpo della richiesta
	const { user: user, body: body } = validation;

	// Estraiamo l'id dell'utente
	const senderId: ObjectId = user._id!;
	// Estraiamo l'i campi
	const { _id, summary } = body;

	// Otteniamo la collezione delle fasi
	const phaseClient: Collection<Phase> = await getCollection<Phase>(
		PHASE_COLLECTION
	);

	const phaseOut = await findCollectionWrapper<Phase>(
		{ _id: _id, ownerId: senderId },
		phaseClient
	);

	if (phaseOut.status !== 200) {
		return phaseOut;
	}

	// Modifichiamo la fase
	return await updateOneCollectionWrapper<Phase>(
		_id!,
		{ summary: summary } as Phase,
		phaseClient
	);
};
