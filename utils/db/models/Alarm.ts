import { ObjectId } from "mongodb";
import { ConvertToString } from "@/db_utils/models/ModelConverter";

/*
NO COLLECTION
*/

export interface Alarm {
	_id: ObjectId;					// ID della notifca
	trigger: string;				// Quanto prima o dopo dovrà essere attivato. Es: trigger: -PT30M (scatta 30 minuti prima), trigger: PT5M (scatta 5 minuti dopo)
	repeat: number;					// Viene ripetuto repeat + 1 volte. La prima volta scatta quando lo dice trigger, poi scatta dopo duration per repeat volte
	duration: string;				// Durata tra ogni repeat
	action: string;					// Azione da eseguire: EMAIL, AUDIO, DISPLAY
	attendee: string;				// destinatario della notifica. È un email, quindi non è "" solo nel caso action: "EMAIL"
	summary: string;				// Titolo della notifica
	description: string;			// Descrizione della notifica
}

export type StringAlarm = ConvertToString<Alarm>;

export function createAlarm({
	_id = new ObjectId(),
	trigger = "",
	repeat = 0,
	duration = "",
	action = "",
	attendee = "",
	summary = "",
	description = "",
}: Partial<Alarm>): Alarm {
	return {
		_id: _id,
		trigger: trigger,
		repeat: repeat,
		duration: duration,
		action: action,
		attendee: attendee,
		summary: summary,
		description: description,
	};
}
