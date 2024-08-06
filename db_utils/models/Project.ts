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

export function createProject({
	summary = "",
	ownerId = new ObjectId(), // Abuso di default value
	userList = [],
	note = new ObjectId(), // Abuso di default value
}: Partial<Project>): Project {
	return {
		summary: summary,
		ownerId: ownerId,
		userList: userList,
		note: note,
	};
}
