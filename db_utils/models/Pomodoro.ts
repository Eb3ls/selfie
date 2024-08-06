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

export function createPomodoro({
	cycles = 4,
	cyclesCompleted = 0,
	studyDuration = 25,
	breakDuration = 5,
	alarms = [],
}: Partial<Pomodoro>): Pomodoro {
	return {
		cycles: cycles,
		cyclesCompleted: cyclesCompleted,
		studyDuration: studyDuration,
		breakDuration: breakDuration,
		alarms: alarms,
	};
}
