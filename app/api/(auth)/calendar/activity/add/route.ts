import {
	addInvitations,
	generateMessageResponse,
	generateObjectResponse,
	generateStringModel,
	removeArrayDuplicates,
	validate
} from "@/utils/api/api";
import {
	ACTIVITY_COLLECTION,
	Activity,
	StringActivity,
	addCollectionWrapper,
	getCollection
} from "@/utils/db/db";
import { Collection } from "mongodb";
import { NextRequest } from "next/server";

const requestTemplate = {
	summary: "",
	description: "",
	status: "",
	dtStart: "",
	due: "",
	categories: [""],
	location: "",
	geo: "",
	parentActivityId: "",
	userIdList: [""],
	alarms: []
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
	const { user: owner, body: newBody } = validation;

	// Creiamo una nuova attività con quei campi
	const newActivity: StringActivity = generateStringModel<StringActivity>(
		newBody,
		"Activity"
	);

	// Otteniamo gli utenti da invitare
	const usersToBeInvited = removeArrayDuplicates(
		newActivity.userIdList.filter((userId) => userId !== owner._id)
	);

	// Aggiungiamo il campo 'owner' a newActivity
	newActivity.ownerId = owner._id!;
	newActivity.userIdList = [owner._id!];

	// Ottieniamo la collezione delle attività
	const client: Collection<Activity> =
		await getCollection<Activity>(ACTIVITY_COLLECTION);

	const activityOut = await addCollectionWrapper(newActivity, client);

	if (activityOut.status !== 200) {
		return activityOut;
	}

	const createdActivity: StringActivity = await activityOut.json();

	// Invitiamo gli utenti
	const inviteOut = await addInvitations(
		usersToBeInvited,
		"ACTIVITY",
		createdActivity._id!
	);

	if (inviteOut.status !== 200) {
		return inviteOut;
	}

	return generateObjectResponse(createdActivity, 200);
};
