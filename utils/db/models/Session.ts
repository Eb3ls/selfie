import { Alarm } from "@/utils/db/models/Alarm";
import { ConvertToString } from "@/utils/db/models/ModelConverter";
import { StringDayInstance, StringPomodoroSettings } from "@/utils/db/models/Pomodoro";
import { timeMachine } from "@/utils/timeMachine/timeMachine";
import { ObjectId } from "mongodb";

/*
COLLECTION
*/

export interface Session {
	_id?: ObjectId;							// ID della sessione
	ownerId: ObjectId;						// ID dell'utente che crea la sessione, e l'unico proprietario
	summary: string;						// Titolo della sessione
	description: string;					// Descrizione della sessione
	status: string;							// Stato della sessione
	rrule: string;							// Regola di ripetizione della sessione
	dtStart: Date;							// Data di inizio della sessione
	dtEnd: Date;							// Data di fine della sessione
	dtStamp: Date;							// Data di creazione della sessione
	settingsList: StringPomodoroSettings[]	// Lista delle impostazioni della sessione
	completedCycles: StringDayInstance[]	// Mappa dei cicli completati in un certo giorno
	alarms: Alarm[];						// Notifiche associate alla sessione
}

export type StringSession = ConvertToString<Session>;

export function createSession({
	ownerId = new ObjectId(),
	summary = "",
	description = "",
	status = "",
	rrule = "",
	dtStart = timeMachine.timeMachineTime,
	dtEnd = timeMachine.timeMachineTime,
	dtStamp = timeMachine.timeMachineTime,
	settingsList = [],
	completedCycles = [],
	alarms = []
}: Partial<Session>): Session {
	return {
		ownerId: ownerId,
		summary: summary,
		description: description,
		status: status,
		rrule: rrule,
		dtStart: dtStart,
		dtEnd: dtEnd,
		dtStamp: dtStamp,
		settingsList: settingsList,
		completedCycles: completedCycles,
		alarms: alarms
	};
}
