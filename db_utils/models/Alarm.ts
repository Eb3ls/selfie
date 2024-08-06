import { ObjectId } from "mongodb";

/*
NO COLLECTION
*/

export interface Alarm {
	_id?: ObjectId;
	trigger: string;
	repeat: number;
	duration: string;
	action: string;
	attendee: string;
	summary: string;
	description: string;
}

export function createAlarm({
	trigger = "",
	repeat = 0,
	duration = "",
	action = "",
	attendee = "",
	summary = "",
	description = "",
}: Partial<Alarm>): Alarm {
	return {
		trigger: trigger,
		repeat: repeat,
		duration: duration,
		action: action,
		attendee: attendee,
		summary: summary,
		description: description,
	};
}
