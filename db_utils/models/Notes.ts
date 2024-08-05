import { ObjectId } from "mongodb";

/*
COLLECTION
*/

export interface Notes {
	_id?: ObjectId;
	text: string;
	length: number;
	access: string;
	dtStamp: Date;
	dtModified: Date;
	userList: ObjectId[];
	activity: ObjectId;
}
