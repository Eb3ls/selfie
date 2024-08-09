import { ObjectId } from "mongodb";
import { Message } from "@/db_utils/models/Message";

/*
COLLECTION
*/

export interface GroupChat {
	_id?: ObjectId; 		  // ID della chat di gruppo
	summary: string; 		  // Titolo della chat
	ownerId: ObjectId;        // Creatore della chat
	userList: ObjectId[];	  // Utenti nel gruppo
	createdAt: Date;		  // Data di creazione della chat
	lastMessageAt: Date;	  // Data dell'ultimo di ultima messaggio
}

export function createGroupChat({
	summary = "",
	ownerId = new ObjectId(),
	userList = [],
	createdAt = new Date(),
	lastMessageAt = new Date(),
}: Partial<GroupChat>): GroupChat {
	return {
		summary: summary,
		ownerId: ownerId,
		userList: userList,
		createdAt: createdAt,
		lastMessageAt: lastMessageAt
	};
}
