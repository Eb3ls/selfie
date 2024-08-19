import { ObjectId } from "mongodb";
import { Alarm } from "@/db_utils/models/Alarm";

/*
COLLECTION
*/

export interface Activity {
	_id?: ObjectId;						// ID dell'attività
	ownerId: ObjectId;					// ID dell'utente che ha creato l'attività
	summary: string;					// Titolo dell'attività
	description: string;				// Descrizione dell'attività
	status: string;						// Stato dell'attività (iCalendar): NEEDS-ACTION, COMPLETED, IN-PROCESS, CANCELLED
	dtStart: Date;						// Data di inizio dell'attività - coincide con dtStamp, le attività hanno solo scadenza
	due: Date;							// Data di scadenza dell'attività
	dtStamp: Date;						// Data di creazione dell'attività
	categories: string[];				// Categorie dell'attività
	location: string;					// Luogo dell'attività
	geo: string;						// Geolocalizzazione dell'attività
	parentActivityId: ObjectId | null;	// Padre dell'attività
	userIdList: ObjectId[];				// Lista degli utenti che partecipano all'attività
	alarms: Alarm[];					// Notifiche associate all'attività
}

export function createActivity({
	ownerId = new ObjectId(),
	summary = "",
	description = "",
	status = "",
	dtStart = new Date(new Date().toISOString()),
	due = new Date(new Date().toISOString()),
	dtStamp = new Date(new Date().toISOString()),
	categories = [],
	location = "",
	geo = "",
	parentActivityId = null,
	userIdList = [],
	alarms = [],
}: Partial<Activity>): Activity {
	return {
		ownerId: ownerId,
		summary: summary,
		description: description,
		status: status,
		dtStart: dtStart,
		due: due,
		dtStamp: dtStamp,
		categories: categories,
		location: location,
		geo: geo,
		parentActivityId: parentActivityId,
		userIdList: userIdList,
		alarms: alarms,
	};
}
