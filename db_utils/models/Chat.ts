import { ObjectId } from "mongodb";
import { Message } from "@/db_utils/models/Message";

/*
COLLECTION
*/

export interface Chat {
	_id?: ObjectId;             	// ID della chat
	users: [ObjectId, ObjectId]; 	// utenti della chat privata
	createdAt: Date; 				// data di creazione
	lastMessageAt: Date | null 		// data ultimo messaggio
}

export function createChat({
	users = [new ObjectId(), new ObjectId()],
	createdAt = new Date(new Date().toISOString()),
	lastMessageAt = null,
	
}: Partial<Chat>): Chat {
	return {
		users: users,
		createdAt: createdAt,
		lastMessageAt: lastMessageAt
	};
}
