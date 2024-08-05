import { ObjectId } from "mongodb";
import { Alarm } from "@/db_utils/models/Alarm";

/*
COLLECTION
*/

export interface Event {
	_id?: ObjectId;
	summary: string;
	description: string;
	status: number;
	rrule: string;
	dtStart: Date;
	dtEnd: Date;
	dtStamp: Date;
	categories: string[];
	location: string;
	geo: string;
	eventSession: ObjectId;
	userList: ObjectId[];
	alarms: Alarm[];
}
