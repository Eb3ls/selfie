import {
	addInvitations,
	generateMessageResponse,
	generateObjectResponse,
	usernameListToIds,
	validate
} from "@/utils/api/api";
import {
	ACTIVITY_COLLECTION,
	Activity,
	StringActivity,
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
	status: "",
	due: "",
	categories: [""],
	location: "",
	geo: "",
	usernameList: [""]
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

	// Creiamo un oggetto senza il campo id
	const { _id, ...newFields } = newBody;

	// Ottieniamo la collezione delle attività
	const client: Collection<Activity> =
		await getCollection<Activity>(ACTIVITY_COLLECTION);

	const out = await findCollectionWrapper<Activity>(
		{ _id: activityId },
		client
	);

	if (out.status !== 200) {
		return out;
	}

	const activity: StringActivity[] = await out.json();

	// Controlliamo che l'owner sia l'utente corrispondente
	if (activity[0].ownerId !== userId) {
		return generateMessageResponse("Unauthorized", 400);
	}

	// Estriamo la lista degli username dal body
	const usernameList: string[] = newBody.usernameList;

	// Convertiamo lo username in id e aggiungiamo lo userId come primo elemento
	const convertionOut = await usernameListToIds(usernameList, userId, true);

	if (convertionOut.status !== 200) {
		return convertionOut;
	}

	const userIdList: string[] = (await convertionOut.json()).users;

	// Sostituiamo la lista degli username con quella degli id, rimuovendo usernameList
	const { usernameList: _, ...smallBody } = newFields;
	const convertedBody = { userIdList: userIdList, ...smallBody };

	// Otteniamo la lista di utenti partecipanti prima della modifica
	const userListBefore = activity[0].userIdList;
	// Otteniamo la lista di utenti partecipanti con la modifica richiesta
	const userListAfter = convertedBody.userIdList;

	// Otteniamo i nuovi utenti
	const newUsers = userListAfter.filter(
		(userId: string) => !userListBefore.includes(userId)
	);

	// Otteniamo gli utenti rimossi
	const removedUsers = userListBefore.filter(
		(userId: string) => !userListAfter.includes(userId)
	);

	// Impostiamo gli utenti partecipanti come prima della modifica
	// ma rimuovendo quelli rimossi
	convertedBody.userIdList = userListBefore.filter(
		(userId: string) => !removedUsers.includes(userId)
	);

	// Modifichiamo l'attività
	const updateOut = await updateCollectionWrapper<Activity>(
		{ _id: activityId },
		{ $set: convertedBody } as any,
		client
	);

	if (updateOut.status !== 200) {
		return updateOut;
	}

	const updatedActivity: StringActivity = (await updateOut.json())[0];

	// Invitiamo i nuovi utenti
	const inviteOut = await addInvitations(newUsers, "ACTIVITY", activityId);

	if (inviteOut.status !== 200) {
		return inviteOut;
	}

	return generateObjectResponse(updatedActivity, 200);
};
