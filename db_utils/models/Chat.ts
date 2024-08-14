import { ObjectId } from "mongodb";
import { Message } from "@/db_utils/models/Message";

/*
COLLECTION
*/

export interface Chat {
	_id?: ObjectId;             	// ID della chat
	users: [ObjectId, ObjectId]; 	// Utenti della chat privata
	createdAt: Date; 				// Data di creazione
	lastMessageAt: Date | null 		// Data ultimo messaggio
	messages: Message[];			// Lista dei messaggi della chat
}

export function createChat({
	users = [new ObjectId(), new ObjectId()],
	createdAt = new Date(new Date().toISOString()),
	lastMessageAt = null,
	messages = [],
}: Partial<Chat>): Chat {
	return {
		users: users,
		createdAt: createdAt,
		lastMessageAt: lastMessageAt,
		messages: messages
	};
}
