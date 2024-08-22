import {
	generateMessageResponse,
	generateStringModel,
	validate
} from "@/utils/api/api";
import {
	PHASE_COLLECTION,
	PROJECT_COLLECTION,
	Phase,
	Project,
	StringPhase,
	StringProject,
	addCollectionWrapper,
	findCollectionWrapper,
	getCollection
} from "@/utils/db/db";
import { Collection } from "mongodb";
import { NextRequest } from "next/server";

const requestTemplate = {
	summary: "",
	projectId: "",
	parentId: ""
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
	const { user: user, body: newBody } = validation;

	// Estraiamo l'id dell'utente
	const userId: string = user._id!;

	//Estraiamo l'id dal body
	const projectId: string = newBody.projectId;

	//Estraiamo il parentId dal body
	const parentId: string = newBody.parentId;

	// Otteniamo la collezione dei progetti
	const projectClient: Collection<Project> =
		await getCollection<Project>(PROJECT_COLLECTION);

	const projectOut = await findCollectionWrapper<Project>(
		{ _id: projectId },
		projectClient
	);

	if (projectOut.status !== 200) {
		return projectOut;
	}

	const project: StringProject[] = await projectOut.json();

	// Controlliamo che l'owner sia l'utente corrispondente
	if (project[0].ownerId !== userId) {
		return generateMessageResponse("Unauthorized", 400);
	}

	//Otteniamo la collezione delle fasi
	const phaseClient: Collection<Phase> =
		await getCollection<Phase>(PHASE_COLLECTION);

	// Controlliamo se il progetto è sottofase
	if (parentId !== projectId) {
		const phaseOut = await findCollectionWrapper<Phase>(
			{ _id: parentId },
			phaseClient
		);

		if (phaseOut.status !== 200) {
			return phaseOut;
		}

		const phase: StringPhase[] = await phaseOut.json();

		// Controlliamo che la fase padre non sia già sottofase del progetto passato
		if (phase[0].parentId !== projectId) {
			return generateMessageResponse("Parent is already a subphase", 400);
		}
	}

	// Creiamo una nuova fase con quei campi
	const newPhase: StringPhase = generateStringModel<StringPhase>(
		newBody,
		"Phase"
	);

	return await addCollectionWrapper(newPhase, phaseClient);
};
