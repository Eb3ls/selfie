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
	const { user, body: newBody } = validation;

	// Estraiamo l'ID dell'utente
	const userId: string = user._id!;

	// Otteniamo la collezione delle note
	const noteClient: Collection<Note> =
		await getCollection<Note>(NOTE_COLLECTION);

	// Otteniamo tutte le note associate all'utente
	const outNote = await findCollectionWrapper<Note>(
		{ userIdList: { $in: [userId] } } as any,
		noteClient
	);

	let notes: any;

	if (outNote.status === 500) {
		// Se c'è stato un errore, ritorna l'errore
		return outNote;
	} else if (outNote.status === 404) {
		// Se non ci sono note, restituiamo un array vuoto
		notes = [];
	} else {
		// Otteniamo le note trovate
		notes = await outNote.json();

		// Iteriamo sulle note per convertire gli ID in nomi utente
		for (let i = 0; i < notes.length; i++) {
			const note = notes[i];

			// Verifica che la lista userIdList esista nella nota
			if (!note.userIdList || !Array.isArray(note.userIdList)) {
				return generateMessageResponse(
					`Invalid or missing userIdList in note at index ${i}`,
					400
				);
			}

			// Convertiamo la lista di ID in una lista di nomi utente
			const idConversionResult = await idListToNameList(note.userIdList);

			if (idConversionResult.status !== 200) {
				// Gestione degli errori nella conversione
				return generateMessageResponse(
					idConversionResult.error ||
						`Error while converting user IDs for note at index ${i}`,
					idConversionResult.status
				);
			}

			// Aggiorniamo la nota con la lista di nomi
			note.userNameList = idConversionResult.userNameList;

			// Rimuoviamo la lista di userIdList per evitare di esporla
			delete note.userIdList;

			// TODO: controllo che se non è l'owner, oltre a essere nella lista la nota deve essere INVITED
		}
	}

	// Restituiamo l'elenco delle note aggiornate
	return generateObjectResponse(notes, 200);
};
