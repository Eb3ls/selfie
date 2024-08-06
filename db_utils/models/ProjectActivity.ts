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

export function createProjectActivity({
	summary = "",
	description = "",
	status = "Not Started",
	dtStart = new Date(),
	due = new Date(),
	dtStamp = new Date(),
	categories = [],
	location = "",
	geo = "",
	input = "",
	output = "",
	isMilestone = false,
	percentage = 0,
	parentId = new ObjectId(),
	child = new ObjectId(),
	phaseId = new ObjectId(),
	userList = [],
	alarms = [],
	note = new ObjectId(),
}: Partial<ProjectActivity>): ProjectActivity {
	return {
		summary: summary,
		description: description,
		status: status,
		dtStart: dtStart,
		due: due,
		dtStamp: dtStamp,
		categories: categories,
		location: location,
		geo: geo,
		input: input,
		output: output,
		isMilestone: isMilestone,
		percentage: percentage,
		parentId: parentId,
		child: child,
		phaseId: phaseId,
		userList: userList,
		alarms: alarms,
		note: note,
	};
}
