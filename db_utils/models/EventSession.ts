import { ObjectId } from "mongodb";
import { createPomodoro, Pomodoro } from "@/db_utils/models/Pomodoro";

/*
COLLECTION
*/

export interface EventSession {
	_id?: ObjectId;					// ID della sessione
	summary: string;				// Titolo della sessione
	pomodoro: Pomodoro | null;		// Pomodoro associato alla sessione e quindi a tutti gli eventi di sessione
	userId: ObjectId;				// ID dell'utente che crea la sessione
}

export function createEventSession({
	summary = "",
	pomodoro = createPomodoro({}),
	userId = new ObjectId(),
}: Partial<EventSession>): EventSession {
	return {
		summary: summary,
		pomodoro: pomodoro,
		userId: userId,
	};
}
