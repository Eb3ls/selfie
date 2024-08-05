import { ObjectId } from "mongodb";

/*
NO COLLECTION
*/

export interface Message {
	_id?: ObjectId;
	text: string;
	dateTime: Date;
	sender: ObjectId;
}
