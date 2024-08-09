import { ObjectId } from "mongodb";
import { Alarm } from "@/db_utils/models/Alarm";

/*
NO COLLECTION
*/

export interface Pomodoro {
	_id: ObjectId; 			// ID del pomodoro
	cycles: number; 			// numero di cicli
	cyclesCompleted: number; 	// cicli completati
	studyDuration: number; 		// durata timer di studio, in minuti
	breakDuration: number; 		// durata timer di pausa, in minuti
	alarms: Alarm[]; 			// notifiche associate
}

export function createPomodoro({
	_id = new ObjectId(),
	cycles = 4,
	cyclesCompleted = 0,
	studyDuration = 25,
	breakDuration = 5,
	alarms = [],
}: Partial<Pomodoro>): Pomodoro {
	return {
		_id: _id,
		cycles: cycles,
		cyclesCompleted: cyclesCompleted,
		studyDuration: studyDuration,
		breakDuration: breakDuration,
		alarms: alarms,
	};
}
