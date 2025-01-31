import { Alarm } from "@/utils/db/models/Alarm";
import { ConvertToString } from "@/utils/db/models/ModelConverter";
import { ObjectId } from "mongodb";

/*
COLLECTION
*/

export interface Event {
	_id?: ObjectId;							// ID dell'evento
	ownerId: ObjectId;						// ID dell'utente che ha creato l'evento
	summary: string;						// Titolo dell'evento
	description: string;					// Descrizione
	status: 
		| "TENTATIVE" 
		| "CONFIRMED" 
		| "CANCELLED";
	rrule: string;							// regola di ripetizione dell'Evento. Es. FREQ=WEEKLY;BYDAY=MO (Ogni lunedì), RRULE:FREQ=DAILY;UNTIL=20240831T235959Z (ogni giorno fino a una data specifica)
	dtStart: Date;							// Data inizio dell'Evento. Es. DTSTART:20240810T150000Z: l'evento si svolge il 10 agosto 2024 alle 15
	dtEnd: Date;							// Data fine dell'evento
	dtStamp: Date;							// Data di creazione dell'evento
	categories: string;						// Categorie dell'evento
	location: string;						// Luogo dell'evento
	geo: string;							// Geolocalizzazione dell'evento
	userIdList: ObjectId[];					// Lista degli utenti a cui appartiene
	alarms: Alarm[];						// Notifiche associate all'evento
}

export type StringEvent = ConvertToString<Event>;

export function createEvent({
	ownerId = new ObjectId(),
	summary = "",
	description = "",
	status = "TENTATIVE",
	rrule = "",
	dtStart = new Date(new Date().toISOString()),
	dtEnd = new Date(new Date().toISOString()),
	dtStamp = new Date(new Date().toISOString()),
	categories = "",
	location = "",
	geo = "",
	userIdList = [],
	alarms = []
}: Partial<Event>): Event {
	return {
		ownerId: ownerId,
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
		userIdList: userIdList,
		alarms: alarms
	};
}
