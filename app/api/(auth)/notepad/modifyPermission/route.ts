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
import { BiBody } from "react-icons/bi";

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
	if (note[0].ownerId !== userId && note[0].access == "PRIVATE") {
		return generateMessageResponse("Unauthorized", 400);
	}

	// Controlliamo caso invited
	if (note[0].access == "INVITED" && note[0].userIdList.includes(userId)) {
		if (newBody.access !== "INVITED" && note[0].ownerId !== userId) {
			return generateMessageResponse("Unauthorized", 400);
		}

		if (userIdList.length !== note[0].userIdList.length) {
			return generateMessageResponse("Unauthorized", 400);
		}

		let unauthorized: boolean = false;

		for (let i = 0; i < userIdList.length; i++) {
			if (!note[0].userIdList.includes(userIdList[i])) {
				unauthorized = true;
			}
		}
		if (unauthorized) {
			return generateMessageResponse("Unauthorized", 400);
		}
	}

	// Creiamo un oggetto con i campi da modificare

	const newFields: Partial<StringNote> = {
		summary: newBody.summary,
		categories: newBody.categories,
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
