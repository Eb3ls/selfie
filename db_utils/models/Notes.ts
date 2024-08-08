import { ObjectId } from "mongodb";

/*
COLLECTION
*/

export interface Notes {
	_id?: ObjectId; 				// ID della nota
	owner: ObjectId; 				// Creatore della nota, coincide col primo elemento di userList
	text: string; 					// Testo della nota in markdown
	length: number; 				// lunghezza testo
	access: string; 				// Permessi della nota: PUBLIC, PRIVATE, INVITED
	dtStamp: Date; 					// Data di creazione della nota
	dtModified: Date; 				// Data di ultima modifica della nota
	userList: ObjectId[]; 			// Lista degli utenti che possono accedere alla nota. Caso PRIVATE e PUBLIC, array di un solo elemento, l'owner. Caso INVITED tutti gli utenti che possono modificare la nota
	activity: ObjectId | null; 		// ID dell'attività a cui la nota fa riferimento. Null se la nota non fa riferimento ad alcuna attività
}

export function createNotes({
	owner = new ObjectId(),
	text = "",
	length = 0,
	access = "public",
	dtStamp = new Date(),
	dtModified = new Date(),
	userList = [],
	activity = new ObjectId(),
}: Partial<Notes>): Notes {
	return {
		owner: owner,
		text: text,
		length: length,
		access: access,
		dtStamp: dtStamp,
		dtModified: dtModified,
		userList: userList,
		activity: activity,
	};
}
