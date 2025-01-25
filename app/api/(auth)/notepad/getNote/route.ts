import { idListToNameList } from "@/utils/api/api";
import {
	generateMessageResponse,
	generateObjectResponse,
	stringsToObjectId
} from "@/utils/api/common";
import {
	NOTE_COLLECTION,
	Note,
	findCollectionWrapper,
	getCollection
} from "@/utils/db/db";
import { Collection, ObjectId } from "mongodb";
import { NextRequest } from "next/server";

export const GET = async (request: NextRequest) => {
	// Validazione della richiesta
	const { searchParams } = new URL(request.url);
	const noteId = searchParams.get("id");

	// Controlliamo che l'ID sia valido
	if (!noteId || !stringsToObjectId([noteId])) {
		return generateMessageResponse("Invalid or missing note ID", 400);
	}

	// Otteniamo la collezione delle note
	const noteClient: Collection<Note> =
		await getCollection<Note>(NOTE_COLLECTION);

	// Otteniamo la nota con l'ID specificato
	const outNote = await findCollectionWrapper<Note>(
		{ _id: noteId },
		noteClient
	);

	if (outNote.status === 500) {
		return generateMessageResponse(
			"Server error while retrieving note",
			500
		);
	} else if (outNote.status === 404) {
		return generateMessageResponse("Note not found", 404);
	}

	let note = await outNote.json();

	// Verifica che la lista userIdList esista nella nota
	if (!note[0].userIdList || !Array.isArray(note[0].userIdList)) {
		return generateMessageResponse(
			"Invalid or missing userIdList in note",
			400
		);
	}

	// Convertiamo la lista di ID in una lista di nomi
	const idConversionResult = await idListToNameList(note[0].userIdList);

	if (idConversionResult.status !== 200) {
		// Gestione degli errori nella conversione
		return generateMessageResponse(
			idConversionResult.error || "Error while converting user IDs",
			idConversionResult.status
		);
	}

	// Aggiungiamo la lista di nomi utente alla nota
	note[0].userNameList = idConversionResult.userNameList;

	// Rimuoviamo la lista di userIdList per evitare di esporla
	delete note[0].userIdList;

	// Restituiamo la nota aggiornata
	return generateObjectResponse(note[0], 200);
};
