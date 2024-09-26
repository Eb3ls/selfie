import {
	generateMessageResponse,
	generateStringModel,
	validate
} from "@/utils/api/api";
import {
	NOTE_COLLECTION,
	Note,
	StringNote,
	addCollectionWrapper,
	getCollection
} from "@/utils/db/db";
import { Collection } from "mongodb";
import { NextRequest } from "next/server";

const requestTemplate = {
	summary: "",
	categories: ""
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
	const { user: user, body: newBody } = validation;

	// Estraiamo l'id dell'utente
	const userId: string = user._id!;

	// Creiamo una nuova nota con quei campi
	const newNote: StringNote = generateStringModel(newBody, "Note");

	// Aggiungiamo il campo 'ownerId' a newNote
	newNote.ownerId = userId;

	// Ottieniamo la collezione delle note
	const noteClient: Collection<Note> =
		await getCollection<Note>(NOTE_COLLECTION);

	return await addCollectionWrapper<Note>(newNote, noteClient);
};
