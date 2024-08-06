import { ObjectId } from "mongodb";
import { Message } from "@/db_utils/models/Message";

/*
COLLECTION
*/

export interface GroupChat {
	_id?: ObjectId;
	summary: string;
	userList: ObjectId[];
	messages: Message[];
	ownerId: ObjectId;
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
