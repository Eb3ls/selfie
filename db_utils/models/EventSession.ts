import { ObjectId } from "mongodb";
import { Pomodoro } from "@/db_utils/models/Pomodoro";

/*
COLLECTION
*/

export interface EventSession {
	_id?: ObjectId;
	summary: string;
	pomodoro: Pomodoro;
	userId: ObjectId;
}
