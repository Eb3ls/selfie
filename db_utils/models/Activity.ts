import { ObjectId } from "mongodb";
import { Alarm } from "@/db_utils/models/Alarm";

/*
COLLECTION
*/

export interface Activity {
	_id?: ObjectId;
	owner: ObjectId;
	summary: string;
	description: string;
	status: string;
	dtStart: Date;
	due: Date;
	dtStamp: Date;
	categories: string[];
	location: string;
	geo: string;
	activityList: Activity[];
	userList: ObjectId[];
	alarms: Alarm[];
}

export function createActivity({
	owner = new ObjectId(),
	summary = "",
	description = "",
	status = "",
	dtStart = new Date(),
	due = new Date(),
	dtStamp = new Date(),
	categories = [],
	location = "",
	geo = "",
	activityList = [],
	userList = [],
	alarms = [],
}: Partial<Activity>): Activity {
	return {
		owner: owner,
		summary: summary,
		description: description,
		status: status,
		dtStart: dtStart,
		due: due,
		dtStamp: dtStamp,
		categories: categories,
		location: location,
		geo: geo,
		activityList: activityList,
		userList: userList,
		alarms: alarms,
	};
}
