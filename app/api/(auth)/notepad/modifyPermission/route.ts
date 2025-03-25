import {
	addInvitations,
	generateMessageResponse,
	generateObjectResponse,
	usernameListToIds,
	validate
} from "@/utils/api/api";
import {
	NOTE_COLLECTION,
	Note,
	StringNote,
	findCollectionWrapper,
	getCollection,
	updateCollectionWrapper
} from "@/utils/db/db";
import { Collection } from "mongodb";
import { NextRequest } from "next/server";

// TODO: Validare l'access per invited da progetti

const requestTemplate = {
	_id: "",
	summary: "",
	categories: "",
	access: "",
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
		return generateMessageResponse("Invalid Request", 400);
	}

	// Estraiamo l'utente e il corpo della richiesta
	const { user: user, body: newBody } = validation;

	// Estraiamo l'id dell'utente
	const userId: string = user._id!;

	// Estraiamo l'id dal body
	const noteId: string = newBody._id!;

	// Estraiamo la lista degli username dal body
	const usernameList: string[] = newBody.usernameList;

	// Convertiamo la lista degli username in lista di id e aggiungiamo lo userId come primo elemento
	const convertionOut = await usernameListToIds(usernameList, userId);

	if (convertionOut.status !== 200) {
		return convertionOut;
	}

	const userIdList = (await convertionOut.json()).users;

	// Ottieniamo la collezione delle note
	const client: Collection<Note> = await getCollection<Note>(NOTE_COLLECTION);

	const noteOut = await findCollectionWrapper<Note>({ _id: noteId }, client);

	if (noteOut.status !== 200) {
		return noteOut;
	}

	const note: StringNote[] = await noteOut.json();

	// Controlliamo che l'owner sia l'utente corrispondente
	if (note[0].ownerId !== userId) {
		return generateMessageResponse("Unauthorized", 400);
	}

	// Creiamo un oggetto senza il campo id
	const { _id, ...newFields } = newBody;

	// Sostituiamo la lista degli username con quella degli id, rimuovendo usernameList
	const { usernameList: _, ...smallBody } = newFields;
	const convertedBody = { userIdList: userIdList, ...smallBody };

	// Otteniamo la lista di utenti partecipanti prima della modifica
	const userListBefore = note[0].userIdList;
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

	// Modifichiamo la nota
	const updateOut = await updateCollectionWrapper<Note>(
		{ _id: noteId },
		{ $set: convertedBody } as any,
		client
	);

	if (updateOut.status !== 200) {
		return updateOut;
	}

	const updatedNote: StringNote = (await updateOut.json())[0];

	// Invitiamo i nuovi utenti
	const inviteOut = await addInvitations(newUsers, "NOTE", noteId);

	if (inviteOut.status !== 200) {
		return inviteOut;
	}

	return generateObjectResponse(updatedNote, 200);
};
