import {
	deletePhase,
	generateMessageResponse,
	validate
} from "@/utils/api/api";
import {
	NOTE_COLLECTION,
	Note,
	PHASE_COLLECTION,
	PROJECT_ACTIVITY_COLLECTION,
	PROJECT_COLLECTION,
	Phase,
	Project,
	ProjectActivity,
	StringPhase,
	StringProject,
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

	// Estraimo l'id dell'utente
	const userId: string = user._id!;

	// Estriamo l'id dal body
	const projectId: string = newBody._id!;

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

	// Ottieniamo la collezione delle fasi
	const phaseClient: Collection<Phase> =
		await getCollection<Phase>(PHASE_COLLECTION);

	// Otteniamo la collezione delle attività
	const projectActivityClient: Collection<ProjectActivity> =
		await getCollection<ProjectActivity>(PROJECT_ACTIVITY_COLLECTION);

	// Ottieniamo la collezione delle note
	const noteClient: Collection<Note> =
		await getCollection<Note>(NOTE_COLLECTION);

	const phaseOut = await findCollectionWrapper<Phase>(
		{ projectId: projectId, parentId: projectId },
		phaseClient
	);

	if (phaseOut.status === 200) {
		const phases: StringPhase[] = await phaseOut.json();
		for (const phase of phases) {
			const deletedPhase = await deletePhase(
				phase,
				phaseClient,
				projectActivityClient,
				noteClient
			);
			if (deletedPhase.status !== 200) {
				return deletedPhase;
			}
		}
	} else if (phaseOut.status === 500) {
		return;
	}

	// Eliminiamo la nota associata al progetto
	const noteOut = await deleteCollectionWrapper<Note>(
		{ _id: project[0].noteId },
		noteClient
	);

	if (noteOut.status !== 200) {
		return noteOut;
	}

	// Eliminiamo il progetto
	return deleteCollectionWrapper<Project>({ _id: projectId }, projectClient);
};
