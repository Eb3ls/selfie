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
