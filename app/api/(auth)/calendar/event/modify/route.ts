import {
	addInvitations,
	divideResourcesAndConvert,
	generateMessageResponse,
	generateObjectResponse,
	isResourceAvailable,
	validate
} from "@/utils/api/api";
import {
	EVENT_COLLECTION,
	Event,
	StringEvent,
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
	categories: "",
	location: "",
	geo: "",
	usernameList: [""],
	alarms: []
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
	const eventId: string = newBody._id!;

	// Creiamo un oggetto senza il campo id
	const { _id, ...newFields } = newBody;

	// Ottieniamo la collezione degli eventi
	const client: Collection<Event> =
		await getCollection<Event>(EVENT_COLLECTION);

	const out = await findCollectionWrapper<Event>({ _id: eventId }, client);

	if (out.status !== 200) {
		return out;
	}

	const event: StringEvent[] = await out.json();

	// Controlliamo che l'owner sia l'utente corrispondente
	if (event[0].ownerId !== userId) {
		return generateMessageResponse("Unauthorized", 400);
	}

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
	const { usernameList: _, ...smallBody } = newFields;
	const convertedBody = { userIdList: userIdList, ...smallBody };

	// Otteniamo la lista di utenti partecipanti prima della modifica
	const userListBefore = event[0].userIdList;
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

	convertedBody.userIdList.push(...resourceIdList);

	// Prendiamo la lista delle categorie separate da virgola non vuote
	const categories = convertedBody.categories
		.split(",")
		.map((category: string) => category.trim())
		.filter((category: string) => category !== "");
	convertedBody.categories = categories.join(",");

	// Modifichiamo l'evento
	const updateOut = await updateCollectionWrapper<Event>(
		{ _id: eventId },
		{ $set: convertedBody } as any,
		client
	);

	if (updateOut.status !== 200) {
		return updateOut;
	}

	const updatedActivity: StringEvent = (await updateOut.json())[0];

	// Invitiamo i nuovi utenti
	const inviteOut = await addInvitations(newUsers, "EVENT", eventId);

	if (inviteOut.status !== 200) {
		return inviteOut;
	}

	return generateObjectResponse(updatedActivity, 200);
};
