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

export function createMessage({
	text = "",
	dateTime = new Date(),
	sender = new ObjectId(),
}: Partial<Message>): Message {
	return {
		text: text,
		dateTime: dateTime,
		sender: sender,
	};
}
