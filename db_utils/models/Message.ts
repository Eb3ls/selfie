import { ObjectId } from "mongodb";

/*
COLLECTION
*/

export interface Message {
	_id?: ObjectId; 	 		// ID del messaggio
	isInGroupChat: boolean;		// True - è un messaggio di un gruppo, False - è un messaggio privato
	senderId: ObjectId;			// ID dell'utente che ha inviato il messaggio
	content: string;			// Contenuto del messaggio
	sentAt: Date;				// Data di invio del messaggio
	receivers: ObjectId[];		// Lista di ID dei destinatari nel caso di un messaggio di un gruppo, contiene un solo elemento in caso di chat privata
	chatId: ObjectId; 			// ID del gruppo o chat privata in cui il messaggio è stato inviato
}

export function createMessage({
	isInGroupChat = false,
	senderId = new ObjectId(),
	content = "",
	sentAt = new Date(new Date().toISOString()),
	receivers = [],
	chatId = new ObjectId(),
}: Partial<Message>): Message {
	return {
		isInGroupChat: isInGroupChat,
		senderId: senderId,
		content: content,
		sentAt: sentAt,
		receivers: receivers,
		chatId: chatId
	};
}
