import { ObjectId } from "mongodb";
import { createPomodoro, Pomodoro } from "@/db_utils/models/Pomodoro";

/*
COLLECTION
*/

export interface EventSession {
	_id?: ObjectId;
	summary: string;
	pomodoro: Pomodoro;
	userId: ObjectId;
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
