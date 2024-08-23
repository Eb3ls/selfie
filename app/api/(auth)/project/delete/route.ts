import { generateMessageResponse, validate } from "@/utils/api/api";
import {
	NOTE_COLLECTION,
	Note,
	PHASE_COLLECTION,
	PROJECT_ACTIVITY_COLLECTION,
	PROJECT_COLLECTION,
	Phase,
	Project,
	ProjectActivity,
	StringProject,
	StringProjectActivity,
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

	const phaseOut = await deleteCollectionWrapper<Phase>(
		{ projectId: projectId },
		phaseClient
	);

	if (phaseOut.status === 500) {
		return;
	}

	// Otteniamo la collezione delle attività
	const projectActivityClient: Collection<ProjectActivity> =
		await getCollection<ProjectActivity>(PROJECT_ACTIVITY_COLLECTION);

	const projectActivityOut = await findCollectionWrapper<ProjectActivity>(
		{ projectId: projectId },
		projectActivityClient
	);

	if (projectActivityOut.status === 500) {
		return projectActivityOut;
	}

	// Ottieniamo la collezione delle note
	const noteClient: Collection<Note> =
		await getCollection<Note>(NOTE_COLLECTION);

	// Controlliamo se esistono attività associate al progetto
	if (projectActivityOut.status === 200) {
		const projectActivities: StringProjectActivity[] =
			await projectActivityOut.json();

		// Eliminiamo le note associate alle attività
		for (const activity of projectActivities) {
			const noteOut = await deleteCollectionWrapper<Note>(
				{ _id: activity.noteId },
				noteClient
			);

			if (noteOut.status !== 200) {
				return noteOut;
			}
		}

		// Eliminiamo le attività associate al progetto
		const deletedProjectActivityOut =
			await deleteCollectionWrapper<ProjectActivity>(
				{ projectId: projectId },
				projectActivityClient
			);

		if (deletedProjectActivityOut.status !== 200) {
			return deletedProjectActivityOut;
		}
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
