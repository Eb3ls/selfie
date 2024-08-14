import { ObjectId } from "mongodb";

/*
COLLECTION
*/

export interface Message {
	_id?: ObjectId; 	 		// ID del messaggio
	senderId: ObjectId;			// ID dell'utente che ha inviato il messaggio
	content: string;			// Contenuto del messaggio
	sentAt: Date;				// Data di invio del messaggio
}

export function createMessage({
	senderId = new ObjectId(),
	content = "",
	sentAt = new Date(),
}: Partial<Message>): Message {
	return {
		senderId: senderId,
		content: content,
		sentAt: sentAt,
	};
}
