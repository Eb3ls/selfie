import { ObjectId } from "mongodb";
import { Alarm } from "@/db_utils/models/Alarm";

/*
COLLECTION
*/

export interface Event {
	_id?: ObjectId;
	owner: ObjectId;
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
	eventSession: ObjectId | null;
	userList: ObjectId[];
	alarms: Alarm[];
}

export function createEvent({
	owner = new ObjectId(),
	summary = "",
	description = "",
	status = 0,
	rrule = "",
	dtStart = new Date(),
	dtEnd = new Date(),
	dtStamp = new Date(),
	categories = [],
	location = "",
	geo = "",
	eventSession = null,
	userList = [],
	alarms = [],
}: Partial<Event>): Event {
	return {
		owner: owner,
		summary: summary,
		description: description,
		status: status,
		rrule: rrule,
		dtStart: dtStart,
		dtEnd: dtEnd,
		dtStamp: dtStamp,
		categories: categories,
		location: location,
		geo: geo,
		eventSession: eventSession,
		userList: userList,
		alarms: alarms,
	};
}
