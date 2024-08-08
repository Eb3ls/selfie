import { ObjectId } from "mongodb";
import { Message } from "@/db_utils/models/Message";

/*
COLLECTION
*/

export interface Chat {
	_id?: ObjectId;         // ID della notifica
	user1: ObjectId; 	    // ID del primo utente
	user2: ObjectId; 		// ID del secondo utente
	messages: Message[];    // messaggi nella chat
}

export function createChat({
	user1 = new ObjectId(),
	user2 = new ObjectId(),
	messages = [],
}: Partial<Chat>): Chat {
	return {
		user1: user1,
		user2: user2,
		messages: messages,
	};
}
