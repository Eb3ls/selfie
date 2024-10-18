import {
	generateMessageResponse,
	generateObjectResponse,
	idListToNameList,
	validate
} from "@/utils/api/api";
import {
	NOTE_COLLECTION,
	Note,
	findCollectionWrapper,
	getCollection
} from "@/utils/db/db";
import { Collection } from "mongodb";
import { NextRequest } from "next/server";

export const GET = async (request: NextRequest) => {
	// Validazione della richiesta
	const validation = await validate<{}>(request, {}, false);

	// Se la validazione fallisce, ritorna il messaggio di errore
	if (validation === null) {
		return generateMessageResponse("Invalid request", 400);
	}

	// Estraiamo l'utente e il corpo della richiesta
	const { user: user, body: newBody } = validation;

	// Estraggo l'id dell'utente
	const userId: string = user._id!;

	// Otteniamo la collezione delle note
	const noteClient: Collection<Note> =
		await getCollection<Note>(NOTE_COLLECTION);

	// Otteniamo tutte le note dell'utente
	const outNote = await findCollectionWrapper<Note>(
		{ userIdList: { $in: [userId] } } as any,
		noteClient
	);

	let notes: any;

	if (outNote.status === 500) {
		// Se c'è stato un errore, ritorna un errore
		return outNote;
	} else if (outNote.status === 404) {
		notes = [];
	} else {
		notes = await outNote.json();
		notes.map(async (note: any) => await idListToNameList(note));
		for (let i = 0; i < notes.length; i++) {
			notes[i] = await idListToNameList(notes[i]);
		}
	}

	return generateObjectResponse(notes, 200);
};
