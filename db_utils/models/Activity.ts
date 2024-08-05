import { ObjectId } from "mongodb";
import { Alarm } from "@/db_utils/models/Alarm";

/*
COLLECTION
*/

export interface Activity {
	_id?: ObjectId;
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
	alarms: Alarm[];
}
