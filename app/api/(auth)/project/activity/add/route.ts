import {
	generateMessageResponse,
	generateStringModel,
	usernameListToIds,
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
	StringNote,
	StringPhase,
	StringProject,
	StringProjectActivity,
	addCollectionWrapper,
	findCollectionWrapper,
	getCollection
} from "@/utils/db/db";
import { Collection } from "mongodb";
import { NextRequest } from "next/server";

const requestTemplate = {
	summary: "",
	description: "",
	dtStart: "",
	due: "",
	isMilestone: false,
	phaseId: "",
	usernameList: []
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

	// Estriamo la lista degli username dal body
	const usernameList: string[] = newBody.usernameList;

	// Convertiamo lo username in id e aggiungiamo lo userId come primo elemento
	const convertionOut = await usernameListToIds(usernameList, userId, false);

	if (convertionOut.status !== 200) {
		return convertionOut;
	}

	const userIdList: string[] = (await convertionOut.json()).users;

	// Otteniamo la collezione delle fasi
	const phaseClient: Collection<Phase> =
		await getCollection<Phase>(PHASE_COLLECTION);

	const phaseOut = await findCollectionWrapper<Phase>(
		{ _id: newBody.phaseId },
		phaseClient
	);

	// Controlliamo che la fase esista
	if (phaseOut.status !== 200) {
		return phaseOut;
	}

	const phase: StringPhase = (await phaseOut.json())[0];

	// Controlliamo che l'owner sia l'utente corrispondente
	if (phase.ownerId !== userId) {
		return generateMessageResponse(
			"User is not the owner of the project",
			400
		);
	}

	const subPhasesOut = await findCollectionWrapper<Phase>(
		{ parentId: phase._id },
		phaseClient
	);

	if (subPhasesOut.status === 200) {
		return generateMessageResponse(
			"Cannot add activity to a phase with subphases",
			400
		);
	} else if (subPhasesOut.status !== 404) {
		return subPhasesOut;
	}

	// Controlliamo che il range di date sia un sottoinsieme del range di date della fase
	if (phase.dtStart > newBody.dtStart || phase.due < newBody.due) {
		return generateMessageResponse(
			"Activity date range is not a subset of the phase date range",
			400
		);
	}

	// Otteniamo la collezione dei progetti
	const projectClient: Collection<Project> =
		await getCollection<Project>(PROJECT_COLLECTION);

	const projectOut = await findCollectionWrapper<Project>(
		{ _id: phase.projectId },
		projectClient
	);

	if (projectOut.status !== 200) {
		return projectOut;
	}

	const project: StringProject[] = await projectOut.json();

	// Controlliamo che la userList sia un sottoinsieme degli utenti del progetto
	if (
		!userIdList!.every((userId) => project[0].userIdList.includes(userId))
	) {
		return generateMessageResponse(
			"UsernameList is not a subset of the project users",
			400
		);
	}

	// Creiamo una nota
	const newNote: StringNote = generateStringModel<StringNote>(
		{
			summary: newBody.summary,
			ownerId: userId,
			userIdList: userIdList
		},
		"Note"
	);

	// Otteniamo la collezione delle note
	const noteClient: Collection<Note> =
		await getCollection<Note>(NOTE_COLLECTION);

	const noteOut = await addCollectionWrapper<Note>(newNote, noteClient);

	if (noteOut.status !== 200) {
		return noteOut;
	}

	const note: StringNote = await noteOut.json();

	// Creiamo l'attività
	const newActivity: StringProjectActivity =
		generateStringModel<StringProjectActivity>(
			{
				summary: newBody.summary,
				description: newBody.description,
				dtStart: newBody.dtStart,
				due: newBody.due,
				ownerId: userId,
				phaseId: newBody.phaseId,
				isMilestone: newBody.isMilestone,
				projectId: project[0]._id,
				userIdList: userIdList,
				noteId: note._id
			},
			"ProjectActivity"
		);

	// Otteniamo la collezione delle attività
	const activityClient: Collection<ProjectActivity> =
		await getCollection<ProjectActivity>(PROJECT_ACTIVITY_COLLECTION);

	return addCollectionWrapper<ProjectActivity>(newActivity, activityClient);
};
