import {
	generateMessageResponse,
	generateObjectResponse,
	usernameListToIds,
	validate
} from "@/utils/api/api";
import {
	NOTE_COLLECTION,
	Note,
	PROJECT_ACTIVITY_COLLECTION,
	PROJECT_COLLECTION,
	Project,
	ProjectActivity,
	StringNote,
	StringProject,
	StringProjectActivity,
	findCollectionWrapper,
	getCollection,
	updateCollectionWrapper
} from "@/utils/db/db";
import { Collection } from "mongodb";
import { NextRequest } from "next/server";

const requestTemplate = {
	_id: "",
	summary: "",
	usernameList: []
};

type RequestType = typeof requestTemplate;

export const PATCH = async (request: NextRequest) => {
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
	const projectId: string = newBody._id!;

	// Estraiamo la lista degli username dal body
	const usernameList: string[] = newBody.usernameList;

	// Convertiamo lo username in id e aggiungiamo lo userId come primo elemento
	const convertionOut = await usernameListToIds(usernameList, userId);

	if (convertionOut.status !== 200) {
		return convertionOut;
	}

	const userIdList: string[] = (await convertionOut.json()).users;

	// Ottieniamo la collezione dei progetti
	const projectClient: Collection<Project> =
		await getCollection<Project>(PROJECT_COLLECTION);

	// Controlliamo che il progetto esista
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

	if (projectActivityOut.status === 200) {
		const projectActivities: StringProjectActivity[] =
			await projectActivityOut.json();

		// Eliminiamo le persone che non fanno più parte del progetto dalle attività
		for (const activity of projectActivities) {
			const newUserIdList = activity.userIdList.filter((id) =>
				userIdList.includes(id)
			);

			const updateOut = await updateCollectionWrapper<ProjectActivity>(
				{ _id: activity._id },
				{ $set: { userIdList: newUserIdList } } as any,
				projectActivityClient
			);

			if (updateOut.status !== 200) {
				return updateOut;
			}
		}
	}

	// Creiamo un oggetto con i campi da modificare
	const newFields: Partial<StringProject> = {
		summary: newBody.summary,
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

	// Dopo aver aggiornato il progetto, aggiungiamo la parte per aggiornare le note
	const noteClient: Collection<Note> =
		await getCollection<Note>(NOTE_COLLECTION);

	// Otteniamo l'elenco degli ID delle note associate al progetto
	const noteId: string = updatedProject.noteId;

	// Controlliamo se il progetto ha delle note associate
	if (noteId.length > 0) {
		// Otteniamo le note utilizzando gli ID presenti in noteId
		const noteOut = await findCollectionWrapper<Note>(
			{ _id: noteId },
			noteClient
		);

		if (noteOut.status !== 200) {
			return noteOut;
		}

		const notes: StringNote[] = await noteOut.json();

		// Aggiungiamo gli utenti alla lista delle note
		for (const note of notes) {
			const updateNoteOut = await updateCollectionWrapper<Note>(
				{ _id: note._id },
				{ $set: { userIdList: userIdList } } as any,
				noteClient
			);

			if (updateNoteOut.status !== 200) {
				return updateNoteOut;
			}
		}
	}

	return generateObjectResponse(updatedProject, 200);
};
