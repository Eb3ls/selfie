import { ObjectId } from "mongodb";

/*
NO COLLECTION
*/

export interface Alarm {
	_id?: ObjectId;
	trigger: string;
	repeat: number;
	duration: string;
	action: string;
	attendee: string;
	summary: string;
	description: string;
}
