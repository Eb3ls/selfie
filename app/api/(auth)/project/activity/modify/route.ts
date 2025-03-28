import {
	generateMessageResponse,
	generateObjectResponse,
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
	StringPhase,
	StringProject,
	StringProjectActivity,
	findCollectionWrapper,
	getCollection,
	updateCollectionWrapper
} from "@/utils/db/db";
import { timeMachine } from "@/utils/timeMachine/timeMachine";
import { Collection } from "mongodb";
import { NextRequest } from "next/server";

const requestTemplate = {
	_id: "",
	summary: "",
	description: "",
	dtStart: "",
	due: "",
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
	const activityId: string = newBody._id!;

	// Estriamo la lista degli username dal body
	const usernameList: string[] = newBody.usernameList;

	// Controlliamo che dtStart sia minore di due
	if (new Date(newBody.dtStart) > new Date(newBody.due)) {
		return generateMessageResponse(
			"dtStart cannot be greater than due",
			400
		);
	}

	// Se il titolo non é tra le 3 e le 50 lettere, ritorna un errore
	if (newBody.summary.length < 3 || newBody.summary.length > 50) {
		return generateMessageResponse("Invalid summary length", 400);
	}

	// Convertiamo lo username in id e aggiungiamo lo userId come primo elemento
	const convertionOut = await usernameListToIds(usernameList, userId, false);

	if (convertionOut.status !== 200) {
		return convertionOut;
	}

	const userIdList: string[] = (await convertionOut.json()).users;

	// Otteniamo la collezione delle attività
	const projectActivityClient: Collection<ProjectActivity> =
		await getCollection<ProjectActivity>(PROJECT_ACTIVITY_COLLECTION);

	const projectActivityOut = await findCollectionWrapper<ProjectActivity>(
		{ _id: activityId },
		projectActivityClient
	);

	if (projectActivityOut.status !== 200) {
		return projectActivityOut;
	}

	const projectActivity: StringProjectActivity[] =
		await projectActivityOut.json();

	// Controlliamo che l'owner sia l'utente corrispondente
	if (projectActivity[0].ownerId !== userId) {
		return generateMessageResponse("Unauthorized", 400);
	}

	// Controlliamo che l'attività non sia completata
	if (projectActivity[0].status === "COMPLETED") {
		return generateMessageResponse(
			"Cannot modify a completed activity",
			400
		);
	}

	// Prendiamo il progetto
	const projectOut = await findCollectionWrapper<Project>(
		{ _id: projectActivity[0].projectId },
		await getCollection<Project>(PROJECT_COLLECTION)
	);

	if (projectOut.status !== 200) {
		return projectOut;
	}

	const project: StringProject = (await projectOut.json())[0];

	// Controlliamo che gli username passati siano un sottoinsieme di quelli del progetto
	if (!userIdList.every((userId) => project.userIdList.includes(userId))) {
		return generateMessageResponse(
			"UsernameList is not a subset of the project users",
			400
		);
	}

	// Otteniamo la collezione delle fasi
	const phaseClient: Collection<Phase> =
		await getCollection<Phase>(PHASE_COLLECTION);

	const phaseOut = await findCollectionWrapper<Phase>(
		{ _id: projectActivity[0].phaseId },
		phaseClient
	);

	if (phaseOut.status !== 200) {
		return phaseOut;
	}

	const phase: StringPhase = (await phaseOut.json())[0];

	// Controlliamo che il range delle date sia un sottoinsieme di quello della fase
	if (phase.dtStart > newBody.dtStart || phase.due < newBody.due) {
		return generateMessageResponse(
			"Activity date range is not a subset of the phase date range",
			400
		);
	}

	// Controlliamo che la dtStart sia maggiore delle due di tutte le prev
	for (const elemId of projectActivity[0].prevIdList) {
		const prevOut = await findCollectionWrapper<ProjectActivity>(
			{ _id: elemId },
			projectActivityClient
		);

		if (prevOut.status !== 200) {
			return prevOut;
		}

		const prev: StringProjectActivity = (await prevOut.json())[0];

		if (newBody.dtStart < prev.due) {
			return generateMessageResponse(
				"The new dtStart is not greater than a previus activity due",
				400
			);
		}
	}

	// Controlliamo che la due sia minore di tutte le dtStart di tutte le next
	for (const elemId of projectActivity[0].nextIdList) {
		const nextOut = await findCollectionWrapper<ProjectActivity>(
			{ _id: elemId },
			projectActivityClient
		);

		if (nextOut.status !== 200) {
			return nextOut;
		}

		const next: StringProjectActivity = (await nextOut.json())[0];

		if (newBody.due > next.dtStart) {
			return generateMessageResponse(
				"The new due is not less than a next activity dtStart",
				400
			);
		}
	}

	// Controlliamo se la lista degli utenti é diversa da quella attuale
	if (
		userIdList.length !== projectActivity[0].userIdList.length ||
		userIdList.some(
			(userId) => !projectActivity[0].userIdList.includes(userId)
		)
	) {
		// Aggiorniamo la lista degli utenti della nota
		const noteClient: Collection<Note> =
			await getCollection<Note>(NOTE_COLLECTION);

		const noteOut = await updateCollectionWrapper<Note>(
			{ _id: projectActivity[0].noteId },
			{ $set: { userIdList: userIdList } } as any,
			noteClient
		);

		if (noteOut.status !== 200) {
			return noteOut;
		}
	}

	const currentDate = timeMachine.timeMachineTime;

	// Aggiorniamo l'attività
	const updateOut = await updateCollectionWrapper<ProjectActivity>(
		{ _id: activityId },
		{
			$set: {
				summary: newBody.summary,
				description: newBody.description,
				dtStart: newBody.dtStart,
				due: newBody.due,
				isOverdue: new Date(newBody.due) <= currentDate,
				userIdList: userIdList
			}
		} as any,
		projectActivityClient
	);

	if (updateOut.status !== 200) {
		return updateOut;
	}

	const updatedProjectActivity: StringProjectActivity = (
		await updateOut.json()
	)[0];

	return generateObjectResponse(updatedProjectActivity, 200);
};
