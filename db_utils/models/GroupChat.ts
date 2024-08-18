import { ObjectId } from "mongodb";
import { Message } from "@/db_utils/models/Message";

/*
COLLECTION
*/

export interface GroupChat {
	_id?: ObjectId;				// ID della chat di gruppo
	summary: string;			// Titolo della chat
	ownerId: ObjectId;			// Creatore della chat
	userList: ObjectId[];		// Utenti nel gruppo (compreso il creatore come primo utente)
	createdAt: Date;			// Data di creazione della chat
	lastMessageAt: Date;		// Data dell'ultimo di ultima messaggio
	messages: Message[];		// Lista dei messaggi della chat
}

export function createGroupChat({
	summary = "",
	ownerId = new ObjectId(),
	userList = [],
	createdAt = new Date(new Date().toISOString()),
	lastMessageAt = new Date(new Date().toISOString()),
	messages = [],
}: Partial<GroupChat>): GroupChat {
	return {
		summary: summary,
		ownerId: ownerId,
		userList: userList,
		createdAt: createdAt,
		lastMessageAt: lastMessageAt,
		messages: messages
	};
}
