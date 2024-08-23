import {
	generateMessageResponse,
	generateObjectResponse,
	usernameListToIds,
	validate
} from "@/utils/api/api";
import {
	PHASE_COLLECTION,
	PROJECT_ACTIVITY_COLLECTION,
	Phase,
	ProjectActivity,
	StringPhase,
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
	description: "",
	dtStart: "",
	due: "",
	isMilestone: false,
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

	// Controlliamo che gli username passati siano un sottoinsieme di quelli del progetto
	if (
		!userIdList.every((userId) =>
			projectActivity[0].userIdList.includes(userId)
		)
	) {
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
	for(const elemId of projectActivity[0].prevIdList) {

		const prevOut = await findCollectionWrapper<ProjectActivity>(
			{ _id: elemId },
			projectActivityClient
		);

		if (prevOut.status !== 200) {
			return prevOut;
		}

		const prev: StringProjectActivity = (await prevOut.json())[0];

		if(newBody.dtStart < prev.due) {
			return generateMessageResponse(
				"the new dtStart is not greater than a previus activity due",
				400
			);
		}
	}

	// Controlliamo che la due sia minore di tutte le dtStart di tutte le next
	for(const elemId of projectActivity[0].nextIdList) {

		const nextOut = await findCollectionWrapper<ProjectActivity>(
			{ _id: elemId },
			projectActivityClient
		);	

		if (nextOut.status !== 200) {
			return nextOut;
		}	

		const next: StringProjectActivity = (await nextOut.json())[0];	

		if(newBody.due > next.dtStart) {
			return generateMessageResponse(
				"the new due is not less than a next activity dtStart",
				400
			);
		}
	}

	const updateOut = await updateCollectionWrapper<ProjectActivity>(
		{ _id: activityId },
		{
			$set: {
				summary: newBody.summary,
				description: newBody.description,
				dtStart: newBody.dtStart,
				due: newBody.due,
				isMilestone: newBody.isMilestone,
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
