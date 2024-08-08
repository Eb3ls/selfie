import { ObjectId } from "mongodb";

/*
NO COLLECTION
*/

export interface Message {
	_id?: ObjectId; 	 // ID del messaggio
	text: string; 	     // Testo del messaggio
	dateTime: Date;      // Data e ora del messaggio
	sender: ObjectId;    // ID dell'utente che ha inviato il messaggio
}

export function createMessage({
	text = "",
	dateTime = new Date(),
	sender = new ObjectId(),
}: Partial<Message>): Message {
	return {
		text: text,
		dateTime: dateTime,
		sender: sender,
	};
}
