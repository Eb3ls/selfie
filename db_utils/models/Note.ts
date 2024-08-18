import { ObjectId} from "mongodb";

/*
COLLECTION
*/

export interface Note {
	_id?: ObjectId;					// ID della nota
	ownerId: ObjectId;				// Creatore della nota, coincide col primo elemento di userList
	summary: string,
	text: string;					// Testo della nota in markdown
	length: number;					// lunghezza testo
	access: 
	| "PRIVATE"
	| "INVITED"
	| "PUBLIC";					
	dtStamp: Date;					// Data di creazione della nota
	dtModified: Date;				// Data di ultima modifica della nota
	userList: ObjectId[];			// Lista degli utenti che possono accedere alla nota. Caso PRIVATE e PUBLIC, array di un solo elemento, l'owner. Caso INVITED tutti gli utenti che possono modificare la nota
	activity: ObjectId[] | null;	// ID dell'attività a cui la nota fa riferimento. Null se la nota non fa riferimento ad alcuna attività
}

export function createNote({
	ownerId = new ObjectId(),
	summary = "",
	text = "",
	length = 0,
	access = "PRIVATE",
	dtStamp = new Date(new Date().toISOString()),
	dtModified = new Date(new Date().toISOString()),
	userList = [],
	activity = [],
}: Partial<Note>): Note {
	return {
		ownerId: ownerId,
		summary: summary,
		text: text,
		length: length,
		access: access,
		dtStamp: dtStamp,
		dtModified: dtModified,
		userList: userList,
		activity: activity,
	};
}
