import { ObjectId } from "mongodb";

/*
COLLECTION
*/

export interface Phase {
	_id?: ObjectId;
	summary: string;
	phaseList: Phase[];
	projectId: ObjectId;
}
