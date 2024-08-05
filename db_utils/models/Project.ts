import { ObjectId } from "mongodb";

/*
COLLECTION
*/

export interface Project {
	_id?: ObjectId;
	summary: string;
	ownerId: ObjectId;
	userList: ObjectId[];
	note: ObjectId; //1:1
}
