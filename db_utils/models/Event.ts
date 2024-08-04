import { ObjectId } from "mongodb";

export interface Event {
	_id?: ObjectId;
	summary: string;
	description: string;
}
