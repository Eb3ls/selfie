import { Alarm } from "@/utils/db/models/Alarm";
import { ConvertToString } from "@/utils/db/models/ModelConverter";
import { ObjectId } from "mongodb";

/*
NO COLLECTION
*/

export interface Pomodoro {
	_id: ObjectId;					// ID del pomodoro
	cycles: number;					// Numero di cicli
	cyclesCompleted: number;		// Cicli completati
	studyDuration: number;			// Durata timer di studio, in minuti
	breakDuration: number;			// Durata timer di pausa, in minuti
	alarms: Alarm[];				// Notifiche associate
}

export type StringPomodoro = ConvertToString<Pomodoro>;

export function createPomodoro({
	_id = new ObjectId(),
	cycles = 4,
	cyclesCompleted = 0,
	studyDuration = 25,
	breakDuration = 5,
	alarms = []
}: Partial<Pomodoro>): Pomodoro {
	return {
		_id: _id,
		cycles: cycles,
		cyclesCompleted: cyclesCompleted,
		studyDuration: studyDuration,
		breakDuration: breakDuration,
		alarms: alarms
	};
}
