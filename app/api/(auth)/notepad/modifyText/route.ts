import {
	generateMessageResponse,
	generateObjectResponse,
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
	text: ""
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

	// Ottieniamo la collezione delle note
	const client: Collection<Note> = await getCollection<Note>(NOTE_COLLECTION);

	const noteOut = await findCollectionWrapper<Note>({ _id: noteId }, client);

	if (noteOut.status !== 200) {
		return noteOut;
	}

	const note: StringNote = (await noteOut.json())[0];

	const isInvited: boolean =
		note.access === "INVITED" && note.userIdList.includes(userId);
	const isCreator: boolean = note.ownerId == userId;
	const isPublic: boolean = note.access === "PUBLIC";

	// Controlliamo che il sender abbia accesso
	if (!isInvited && !isCreator && !isPublic) {
		return generateMessageResponse("Sender doesn't have access", 400);
	}

	const length = newBody.text.length;

	// Creiamo un oggetto con i campi da modificare
	const newFields: Partial<StringNote> = {
		text: newBody.text,
		length: newBody.text.length
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
