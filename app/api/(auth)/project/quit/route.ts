import {
	generateMessageResponse,
	generateObjectResponse,
	validate
} from "@/utils/api/api";
import {
	Note,
	Project,
	ProjectActivity,
	StringProject,
	StringProjectActivity
} from "@/utils/db/db";
import {
	NOTE_COLLECTION,
	PROJECT_ACTIVITY_COLLECTION,
	PROJECT_COLLECTION,
	getCollection
} from "@/utils/db/db_functions";
import {
	findCollectionWrapper,
	updateCollectionWrapper
} from "@/utils/db/db_wrappers";
import { Collection } from "mongodb";
import { NextRequest } from "next/server";

const requestTemplate = {
	projectId: ""
};
type RequestType = typeof requestTemplate;

export const POST = async (request: NextRequest) => {
	const validation = await validate<RequestType>(
		request,
		requestTemplate,
		false
	);

	if (validation === null) {
		return generateMessageResponse("Invalid request", 400);
	}

	const { user: user, body: newBody } = validation;

	// Estraiamo l'id dell'utente
	const userId: string = user._id!;

	// Estraiamo l'id dal body
	const projectId: string = newBody.projectId!;

	// Otteniamo la collezione dei progetti
	const projectClient: Collection<Project> =
		await getCollection<Project>(PROJECT_COLLECTION);

	// Otteniamo il progetto
	const projectOut = await findCollectionWrapper<Project>(
		{ _id: projectId },
		projectClient
	);

	if (projectOut.status !== 200) {
		return projectOut;
	}

	const project: StringProject = (await projectOut.json())[0];

	// Controlliamo che l'utente non sia l'owner del progetto
	if (project.ownerId === userId) {
		return generateMessageResponse("Owner cannot quit project", 400);
	}

	// Controlliamo che l'utente sia nella lista degli utenti
	if (!project.userIdList.includes(userId)) {
		return generateMessageResponse("User not in project", 400);
	}

	// Otteniamo la collezione delle attività
	const projectActivityClient: Collection<ProjectActivity> =
		await getCollection<ProjectActivity>(PROJECT_ACTIVITY_COLLECTION);

	const projectActivityOut = await findCollectionWrapper<ProjectActivity>(
		{ projectId: projectId },
		projectActivityClient
	);

	if (projectActivityOut.status === 500) {
		return;
	}

	// Otteniamo la collezione delle note
	const noteClient: Collection<Note> =
		await getCollection<Note>(NOTE_COLLECTION);

	if (projectActivityOut.status === 200) {
		const projectActivities: StringProjectActivity[] =
			await projectActivityOut.json();

		// Troviamo le activity che hanno associato l'utente che sta uscendo
		const activitiesToUpdate = projectActivities.filter((activity) =>
			activity.userIdList.includes(userId)
		);

		// Eliminiamo l'utente dalla lista degli utenti
		for (const activity of activitiesToUpdate) {
			const newUserIdList = activity.userIdList.filter(
				(id) => id !== userId
			);

			const updateOut = await updateCollectionWrapper<ProjectActivity>(
				{ _id: activity._id },
				{ $set: { userIdList: newUserIdList } } as any,
				projectActivityClient
			);

			if (updateOut.status !== 200) {
				return updateOut;
			}

			const updateNoteOut = await updateCollectionWrapper<Note>(
				{ _id: activity.noteId },
				{ $set: { userIdList: newUserIdList } } as any,
				noteClient
			);

			if (updateNoteOut.status !== 200) {
				return updateNoteOut;
			}
		}
	}

	const userIdList = project.userIdList.filter((id) => id !== userId);

	// Creiamo un oggetto con i campi da modificare
	const newFields: Partial<StringProject> = {
		userIdList: userIdList
	};

	// Modifichiamo il progetto
	const updateOut = await updateCollectionWrapper<Project>(
		{ _id: projectId },
		{ $set: newFields } as any,
		projectClient
	);

	if (updateOut.status !== 200) {
		return updateOut;
	}

	const updatedProject: StringProject = (await updateOut.json())[0];

	// Togliamo il primo utente che é l'owner
	userIdList.shift();

	// Aggiungiamo gli utenti alla lista di persone invitate della nota
	const updateNoteOut = await updateCollectionWrapper<Note>(
		{ _id: updatedProject.noteId },
		{ $set: { userIdList: userIdList } } as any,
		noteClient
	);

	if (updateNoteOut.status !== 200) {
		return updateNoteOut;
	}

	return generateObjectResponse(updatedProject, 200);
};
