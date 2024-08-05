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
