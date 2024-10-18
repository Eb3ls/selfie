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
	note[0] = await idListToNameList(note[0]);

	// Restituisci la nota
	return generateObjectResponse(note[0], 200);
};
