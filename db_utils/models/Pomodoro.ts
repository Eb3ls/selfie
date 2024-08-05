import { ObjectId } from "mongodb";
import { Alarm } from "@/db_utils/models/Alarm";

/*
NO COLLECTION
*/

export interface Pomodoro {
	_id?: ObjectId;
	cycles: number;
	cyclesCompleted: number;
	studyDuration: number;
	breakDuration: number;
	alarms: Alarm[];
}
