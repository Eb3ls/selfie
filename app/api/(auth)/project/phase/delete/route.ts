import { NextRequest } from "next/server";
import { Collection, ObjectId } from "mongodb";
import {
	getCollection,
	PHASE_COLLECTION,
	PROJECT_COLLECTION,
} from "@/db_utils/db_functions";
import {
	findCollectionWrapper,
	deleteCollectionWrapper,
} from "@/db_utils/db_wrappers";
import { Phase } from "@/db_utils/models/Phase";
import { Project } from "@/db_utils/models/Project";
import {
	generateMessageResponse,
	standardValidation,
} from "@/api_utils/api_functions";

const requestTemplate: Partial<Phase> = {
	_id: new ObjectId(),
};

export const DELETE = async (request: NextRequest) => {
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
	// Estraiamo l'id della fase
	const _id: ObjectId = body._id!;

	// Otteniamo la collezione delle fasi
	const phaseClient: Collection<Phase> = await getCollection<Phase>(
		PHASE_COLLECTION
	);

	const phaseOut = await findCollectionWrapper<Phase>(
		{ _id: _id },
		phaseClient
	);

	if (phaseOut.status !== 200) {
		return phaseOut;
	}

	// Estraiamo il projectId
	const phaseData: Phase[] = await phaseOut.json();
	const projectId: ObjectId = phaseData[0].projectId;

	// Otteniamo la collezione dei progetti
	const projectClient: Collection<Project> = await getCollection<Project>(
		PROJECT_COLLECTION
	);

	const projectOut = await findCollectionWrapper<Project>(
		{ _id: projectId },
		projectClient
	);

	if (projectOut.status !== 200) {
		return projectOut;
	}

	const projectData: Project[] = await projectOut.json();

	// Controlliamo che l'utente sia il proprietario del progetto
	if (!senderId.equals(projectData[0].ownerId)) {
		return generateMessageResponse(
			"User is not the owner of the project",
			400
		);
	}

	// Otteniamo le sottofasi
	const subPhases = await findCollectionWrapper<Phase>(
		{ parentId: _id },
		phaseClient
	);

	if (subPhases.status !== 200) {
		return subPhases;
	}

	const subPhasesData: Phase[] = await subPhases.json();

	// Eliminiamo le sottofasi
	while (subPhasesData.length > 0) {
		const subPhase = subPhasesData.shift()!;
		const subPhaseId = new ObjectId(subPhase._id);
		const result = await deleteCollectionWrapper<Phase>(
			subPhaseId,
			phaseClient
		);
		if (result.status !== 200) {
			return result;
		}
	}

	// Eliminiamo la fase
	return await deleteCollectionWrapper<Phase>(_id!, phaseClient);

	// TODO aggiungere la cancellazione delle activity
};
