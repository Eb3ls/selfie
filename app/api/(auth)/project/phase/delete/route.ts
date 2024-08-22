import { generateMessageResponse, validate } from "@/utils/api/api";
import {
	PHASE_COLLECTION,
	Phase,
	StringPhase,
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

	if (phase[0].parentId === phase[0].projectId) {
		// Otteniamo le sottofasi
		const subPhasesOut = await findCollectionWrapper<Phase>(
			{ parentId: phaseId },
			phaseClient
		);

		// Se ci sono sottofasi, le cancelliamo
		if (subPhasesOut.status === 200) {
			const subPhases: StringPhase[] = await subPhasesOut.json();

			// Eliminiamo le sottofasi
			while (subPhases.length > 0) {
				const subPhase = subPhases.shift()!;
				const subPhaseOut = await deleteCollectionWrapper<Phase>(
					{ _id: subPhase._id },
					phaseClient
				);

				if (subPhaseOut.status !== 200) {
					return subPhaseOut;
				}
			}
		}
	}

	// Eliminiamo la fase
	return await deleteCollectionWrapper<Phase>({ _id: phaseId }, phaseClient);

	// TODO: eliminare tutte le attività associate alla fase
	// per ogni attività, eliminare nei link le attività associate
};
