import { ObjectId } from "mongodb";
import { Message } from "@/db_utils/models/Message";

/*
COLLECTION
*/

export interface Chat {
	_id?: ObjectId;
	user1: ObjectId;
	user2: ObjectId;
	messages: Message[];
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
