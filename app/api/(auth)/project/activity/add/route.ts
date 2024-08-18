import { NextRequest } from "next/server";
import { Collection, ObjectId } from "mongodb";
import {
	getCollection,
	PROJECT_COLLECTION,
	PHASE_COLLECTION,
	NOTE_COLLECTION,
	PROJECT_ACTIVITY_COLLECTION,
} from "@/db_utils/db_functions";
import {
	findCollectionWrapper,
	addCollectionWrapper,
} from "@/db_utils/db_wrappers";
import { Project } from "@/db_utils/models/Project";
import { Phase } from "@/db_utils/models/Phase";
import { Note, createNote } from "@/db_utils/models/Note";
import {
	ProjectActivity,
	createProjectActivity,
} from "@/db_utils/models/ProjectActivity";
import {
	generateMessageResponse,
	standardValidation,
	getIdFromUsername,
} from "@/api_utils/api_functions";

const requestTemplate: Partial<ProjectActivity> = {
	summary: "",
	description: "",
	dtStart: new Date(),
	due: new Date(),
	isMilestone: false,
	phaseId: new ObjectId(),
	projectId: new ObjectId(),
	userList: [],
};

export const POST = async (request: NextRequest) => {
	// Validazione standard
	const validation = await standardValidation<ProjectActivity>(
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

	const senderId: ObjectId = user._id!;
	const phaseId: ObjectId = body.phaseId!;
	const projectId: ObjectId = body.projectId!;

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
	const projectUsersList = project[0].userList;

	if (!senderId.equals(project[0].ownerId)) {
		return generateMessageResponse(
			"User is not the owner of the project",
			400
		);
	}

	// Inseriamo il proprietario del progetto nell'attività
	body.ownerId = senderId;

	const userList = await getIdFromUsername(
		Array.of(String(body.userList)),
		senderId
	);

	if (userList.status !== 200) {
		return userList;
	}

	const userListObj = await userList.json();
	body.userList = userListObj.users;

	// Controlliamo che la userList sia un sottoinsieme degli utenti del progetto
	if (!body.userList!.every((userId) => projectUsersList.includes(userId))) {
		return generateMessageResponse(
			"UserList is not a subset of the project users",
			400
		);
	}

	// Otteniamo la collezione delle fasi
	const phaseClient: Collection<Phase> = await getCollection<Phase>(
		PHASE_COLLECTION
	);

	const phaseOut = await findCollectionWrapper<Phase>(
		{ _id: phaseId },
		phaseClient
	);

	// Controlliamo che la fase esista
	if (phaseOut.status !== 200) {
		return phaseOut;
	}

	const phaseData: Phase[] = await phaseOut.json();
	const phaseProjectId = new ObjectId(phaseData[0].projectId);

	if (!phaseProjectId.equals(projectId)) {
		return generateMessageResponse(
			"Phase does not belong to the project",
			400
		);
	}

	// Creiamo una nota
	const newNote = createNote({
		ownerId: senderId,
		summary: body.summary,
		access: "INVITED",
		userList: body.userList,
	});

	// Otteniamo la collezione delle note
	const noteClient: Collection<Note> = await getCollection<Note>(
		NOTE_COLLECTION
	);

	// Inseriamo la nota
	const insertedNote = await addCollectionWrapper<Note>(newNote, noteClient);

	if (insertedNote.status !== 200) {
		return insertedNote;
	}

	// Inseriamo l'id della nota nell'attività
	const note: Note = await insertedNote.json();
	body.noteId = new ObjectId(note._id);

	// Creiamo l'attività
	const activity: ProjectActivity = createProjectActivity(body);

	// Otteniamo la collezione delle attività
	const activityClient: Collection<ProjectActivity> =
		await getCollection<ProjectActivity>(PROJECT_ACTIVITY_COLLECTION);

	// Inseriamo l'attività
	return await addCollectionWrapper<ProjectActivity>(
		activity,
		activityClient
	);
};
