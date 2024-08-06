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

export function createNotes({
	text = "",
	length = 0,
	access = "public",
	dtStamp = new Date(),
	dtModified = new Date(),
	userList = [],
	activity = new ObjectId(),
}: Partial<Notes>): Notes {
	return {
		text: text,
		length: length,
		access: access,
		dtStamp: dtStamp,
		dtModified: dtModified,
		userList: userList,
		activity: activity,
	};
}
