import { ObjectId } from "mongodb";
import { Alarm } from "@/db_utils/models/Alarm";

/*
COLLECTION
*/

export interface ProjectActivity {
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
	input: string;
	output: string;
	isMilestone: boolean;
	percentage: number;
	parentId: ObjectId;
	child: ObjectId;
	phaseId: ObjectId;
	userList: ObjectId[];
	alarms: Alarm[];
	note: ObjectId;
}
