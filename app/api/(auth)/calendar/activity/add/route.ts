import {
	addInvitations,
	divideResourcesAndConvert,
	generateMessageResponse,
	generateObjectResponse,
	generateStringModel,
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
	categories: "",
	location: "",
	geo: "",
	parentActivityId: "",
	usernameList: [""],
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

	// Estraiamo l'id dell'utente
	const userId: string = owner._id!;

	// Estriamo la lista degli username dal body
	const usernameList: string[] = newBody.usernameList;

	// Dividiamo e convertiamo la lista degli username e risorse in una lista di id
	const convertionOut = await divideResourcesAndConvert(
		usernameList,
		userId,
		true
	);

	if (convertionOut.status !== 200) {
		return convertionOut;
	}

	const { userIdList, resourceIdList } = (await convertionOut.json()) as {
		userIdList: string[];
		resourceIdList: string[];
	};

	// Sostituiamo la lista degli username con quella degli id, rimuovendo usernameList
	const { usernameList: _, ...smallBody } = newBody;
	const convertedBody = { userIdList: userIdList, ...smallBody };

	// Creiamo una nuova attività con quei campi
	const newActivity: StringActivity = generateStringModel<StringActivity>(
		convertedBody,
		"Activity"
	);

	// Otteniamo gli utenti da invitare
	const usersToBeInvited = newActivity.userIdList.filter(
		(id) => id !== userId
	);

	// Aggiungiamo il campo 'owner' a newActivity
	newActivity.ownerId = owner._id!;
	newActivity.userIdList = [...resourceIdList, owner._id!];

	// Prendiamo la lista delle categorie separate da virgola non vuote
	const categories = newActivity.categories
		.split(",")
		.map((category: string) => category.trim())
		.filter((category: string) => category !== "");
	newActivity.categories = categories.join(",");

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
