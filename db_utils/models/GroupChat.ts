import { ObjectId } from "mongodb";
import { Message } from "@/db_utils/models/Message";

/*
COLLECTION
*/

export interface GroupChat {
	_id?: ObjectId; 		  // ID della chat di gruppo
	summary: string; 		  // Titolo della chat
	userList: ObjectId[];	  // Utenti nel gruppo
	messages: Message[];      // Messaggi della chat
	ownerId: ObjectId;        // Creatore della chat
}

export function createGroupChat({
	summary = "",
	userList = [],
	messages = [],
	ownerId = new ObjectId(),
}: Partial<GroupChat>): GroupChat {
	return {
		summary: summary,
		userList: userList,
		messages: messages,
		ownerId: ownerId,
	};
}
