import { ConvertToString } from "@/utils/db/models/ModelConverter";
import { Pomodoro, createPomodoro } from "@/utils/db/models/Pomodoro";
import { ObjectId } from "mongodb";

/*
COLLECTION
*/

export interface Session {
	_id?: ObjectId;					// ID della sessione
	ownerId: ObjectId;				// ID dell'utente che crea la sessione, e l'unico proprietario
	summary: string;				// Titolo della sessione
	description: string;			// Descrizione della sessione
	status: string;					// Stato della sessione
	rrule: string;					// Regola di ripetizione della sessione
	dtStart: Date;					// Data di inizio della sessione
	dtEnd: Date;					// Data di fine della sessione
	dtStamp: Date;					// Data di creazione della sessione
	pomodoro: Pomodoro;				// Pomodoro associato alla sessione e quindi a tutti gli eventi di sessione
}

export type StringSession = ConvertToString<Session>;

export function createSession({
	ownerId = new ObjectId(),
	summary = "",
	description = "",
	status = "",
	rrule = "",
	dtStart = new Date(new Date().toISOString()),
	dtEnd = new Date(new Date().toISOString()),
	dtStamp = new Date(new Date().toISOString()),
	pomodoro = createPomodoro({})
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
		pomodoro: pomodoro
	};
}
