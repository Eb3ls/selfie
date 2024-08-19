import { ObjectId } from "mongodb";
import { Message } from "@/db_utils/models/Message";

/*
COLLECTION
*/

export interface Chat {
	_id?: ObjectId;						// ID della chat
	userIdList: [ObjectId, ObjectId];	// Utenti della chat privata
	createdAt: Date;					// Data di creazione
	lastMessageAt: Date | null;			// Data ultimo messaggio
	messages: Message[];				// Lista dei messaggi della chat
}

export function createChat({
	userIdList = [new ObjectId(), new ObjectId()],
	createdAt = new Date(new Date().toISOString()),
	lastMessageAt = null,
	messages = [],
}: Partial<Chat>): Chat {
	return {
		userIdList: userIdList,
		createdAt: createdAt,
		lastMessageAt: lastMessageAt,
		messages: messages
	};
}
