import { NextRequest } from "next/server";
import { Collection, ObjectId } from "mongodb";
import {
	getCollection,
	PROJECT_ACTIVITY_COLLECTION,
} from "@/db_utils/db_functions";
import {
	findCollectionWrapper,
	updateOneCollectionWrapper,
} from "@/db_utils/db_wrappers";
import { ProjectActivity } from "@/db_utils/models/ProjectActivity";
import {
	generateMessageResponse,
	getIdFromUsername,
	standardValidation,
} from "@/api_utils/api_functions";

const requestTemplate: Partial<ProjectActivity> = {
	_id: new ObjectId(),
	summary: "",
	description: "",
	dtStart: new Date(),
	due: new Date(),
	isMilestone: false,
	userIdList: [],
};

export const PATCH = async (request: NextRequest) => {
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

	// Estraiamo l'utente
	const senderId: ObjectId = user._id!;
	// Estraiamo l'id dell'attività
	const { _id, ...newBody } = body;

	const usersOut = await getIdFromUsername(
		newBody.userIdList as unknown as string[],
		senderId,
		false
	);

	if (usersOut.status !== 200) {
		return usersOut;
	}

	const userListData = await usersOut.json();
	const correctUserList = userListData.users;
	newBody.userIdList = correctUserList.map(
		(user: string) => new ObjectId(user)
	);

	// Otteniamo la collezione delle attività
	const projectActivityClient: Collection<ProjectActivity> =
		await getCollection<ProjectActivity>(PROJECT_ACTIVITY_COLLECTION);

	const projectActivityOut = await findCollectionWrapper<ProjectActivity>(
		{ _id: _id, ownerId: senderId },
		projectActivityClient
	);

	// Se l'attività non esiste, ritorna un errore
	if (projectActivityOut.status !== 200) {
		return projectActivityOut;
	}

	// Estraiamo l'attività
	const projectActivity: ProjectActivity = (
		await projectActivityOut.json()
	)[0];

	if (projectActivity.status === "COMPLETED") {
		return generateMessageResponse(
			"Cannot modify a completed activity",
			400
		);
	}

	// Se la data di inizio è maggiore della data di scadenza, ritorna un errore
	if (newBody.dtStart && newBody.due && newBody.dtStart > newBody.due) {
		return generateMessageResponse("Invalid date", 400);
	}

	return updateOneCollectionWrapper<ProjectActivity>(
		_id!,
		newBody as ProjectActivity,
		projectActivityClient
	);

	// TODO: Check modifiche date valide per le project activity
	// linkate. Perchè le date non possono essere sovrapponibili
};
