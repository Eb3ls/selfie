import { ObjectId } from "mongodb";
import { Alarm } from "@/db_utils/models/Alarm";

/*
COLLECTION
*/

export interface Event {
	_id?: ObjectId;							// ID dell'evento
	owner: ObjectId;						// ID dell'utente che ha creato l'evento
	summary: string;						// Titolo dell'evento
	description: string;					// Descrizione
	status: string;							// TENTATIVE, CONFIRMED, CANCELLED
	rrule: string;							// regola di ripetizione dell'Evento. Es. FREQ=WEEKLY;BYDAY=MO (Ogni lunedì), RRULE:FREQ=DAILY;UNTIL=20240831T235959Z (ogni giorno fino a una data specifica)
	dtStart: Date;							// Data inizio dell'Evento. Es. DTSTART:20240810T150000Z: l'evento si svolge il 10 agosto 2024 alle 15
	dtEnd: Date;							// Data fine dell'evento
	dtStamp: Date;							// Data di creazione dell'evento
	categories: string[];					// Categorie dell'evento
	location: string;						// Luogo dell'evento
	geo: string;							// Geolocalizzazione dell'evento
	eventSession: ObjectId | null;			// Sessione a cui appartiene, potrebbe non appartenere a nessuna sessione
	userList: ObjectId[];					// Lista degli utenti a cui appartiene
	alarms: Alarm[];						// Notifiche associate all'evento
}

export function createEvent({
	owner = new ObjectId(),
	summary = "",
	description = "",
	status = "",
	rrule = "",
	dtStart = new Date(),
	dtEnd = new Date(),
	dtStamp = new Date(),
	categories = [],
	location = "",
	geo = "",
	eventSession = null,
	userList = [],
	alarms = [],
}: Partial<Event>): Event {
	return {
		owner: owner,
		summary: summary,
		description: description,
		status: status,
		rrule: rrule,
		dtStart: dtStart,
		dtEnd: dtEnd,
		dtStamp: dtStamp,
		categories: categories,
		location: location,
		geo: geo,
		eventSession: eventSession,
		userList: userList,
		alarms: alarms,
	};
}
