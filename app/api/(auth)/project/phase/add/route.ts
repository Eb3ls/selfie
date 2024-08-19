import { NextRequest } from "next/server";
import { Collection, ObjectId } from "mongodb";
import {
	getCollection,
	PROJECT_COLLECTION,
	PHASE_COLLECTION,
} from "@/db_utils/db_functions";
import {
	findCollectionWrapper,
	addCollectionWrapper,
} from "@/db_utils/db_wrappers";
import { Project } from "@/db_utils/models/Project";
import { Phase, createPhase } from "@/db_utils/models/Phase";
import {
	generateMessageResponse,
	standardValidation,
} from "@/api_utils/api_functions";

const requestTemplate: Partial<Phase> = {
	summary: "",
	projectId: new ObjectId(),
	parentId: new ObjectId(),
};

export const POST = async (request: NextRequest) => {
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
	//Estraiamo il projectId
	const projectId: ObjectId = body.projectId!;
	//Estraiamo il parentId
	const parentId: ObjectId = body.parentId!;

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

	const project: Project[] = await projectOut.json();

	// Controlliamo che l'utente sia il proprietario del progetto
	if (!senderId.equals(project[0].ownerId)) {
		return generateMessageResponse(
			"User is not the owner of the project",
			400
		);
	}

	//Otteniamo la collezione delle fasi
	const phaseClient: Collection<Phase> = await getCollection<Phase>(
		PHASE_COLLECTION
	);

	// Controlliamo se il progetto è sottofase
	if (!projectId.equals(parentId)) {
		const phaseOut = await findCollectionWrapper<Phase>(
			{ _id: parentId },
			phaseClient
		);

		if (phaseOut.status !== 200) {
			return phaseOut;
		}

		const phase: Phase[] = await phaseOut.json();

		// Controlliamo che la fase padre non sia già sottofase del progetto passato
		if (!projectId.equals(phase[0].parentId)) {
			return generateMessageResponse("Parent is already a subphase", 400);
		}
	}

	body.ownerId = new ObjectId(senderId);
	body.projectId = new ObjectId(projectId);
	body.parentId = new ObjectId(parentId);

	// Creiamo una nuova fase con quei campi
	const newPhase: Phase = createPhase(body);

	return await addCollectionWrapper(newPhase, phaseClient);
};
