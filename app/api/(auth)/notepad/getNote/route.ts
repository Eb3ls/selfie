import { idListToNameList, validate } from "@/utils/api/api";
import {
	generateMessageResponse,
	generateObjectResponse,
	stringsToObjectId
} from "@/utils/api/common";
import {
	NOTE_COLLECTION,
	Note,
	StringNote,
	findCollectionWrapper,
	getCollection
} from "@/utils/db/db";
import { Collection, ObjectId } from "mongodb";
import { NextRequest } from "next/server";

export const GET = async (request: NextRequest) => {
	// Validazione della richiesta
	const validation = await validate<{}>(request, {}, false);

	// Se la validazione fallisce, ritorna il messaggio di errore
	if (validation === null) {
		return generateMessageResponse("Invalid request", 400);
	}

	// Estraiamo l'utente e il corpo della richiesta
	const { user, body: newBody } = validation;

	// Estraiamo l'ID dell'utente
	const userId: string = user._id!;

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

	let note: StringNote[] = await outNote.json();

	// Verifica che la lista userIdList esista nella nota
	if (!note[0].userIdList || !Array.isArray(note[0].userIdList)) {
		return generateMessageResponse(
			"Invalid or missing userIdList in note",
			400
		);
	}

	if (note[0].access === "PRIVATE" && note[0].ownerId !== userId) {
		return generateMessageResponse(
			"User not authorized to access note",
			403
		);
	}

	// Verifichiamo che l'utente appartenga alla lista di userIdList
	if (note[0].access === "INVITED" && !note[0].userIdList.includes(userId)) {
		return generateMessageResponse(
			"User not authorized to access note",
			403
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

	const { userIdList, ...noteData } = note[0];
	const noteDataWithNames = {
		...noteData,
		userNameList: idConversionResult.userNameList
	};

	// Restituiamo la nota aggiornata
	return generateObjectResponse(noteDataWithNames, 200);
};
