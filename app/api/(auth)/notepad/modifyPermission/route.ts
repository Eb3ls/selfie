import {
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

const requestTemplate = {
	_id: "",
	summary: "",
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
		return generateMessageResponse("Invalid request", 400);
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

	const userIdList: string[] = (await convertionOut.json()).users;

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

	// Creiamo un oggetto con i campi da modificare
	const newFields: Partial<StringNote> = {
		summary: newBody.summary,
		access: newBody.access as "PRIVATE" | "INVITED" | "PUBLIC",
		userIdList: userIdList
	};

	// Modifichiamo la nota
	const updateOut = await updateCollectionWrapper<Note>(
		{ _id: noteId },
		{ $set: newFields } as any,
		client
	);

	if (updateOut.status !== 200) {
		return updateOut;
	}

	const updatedNote: StringNote = (await updateOut.json())[0];

	return generateObjectResponse(updatedNote, 200);
};
