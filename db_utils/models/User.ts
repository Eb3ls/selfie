import { ObjectId } from "mongodb";
import { Pomodoro } from "@/db_utils/models/Pomodoro";

/*
COLLECTION
*/

export interface User {
	_id?: ObjectId;
	username: string;
	firstName: string;
	lastName: string;
	email: string;
	password: string;
	birthDay: Date;
	userStatus: string;
	profilePic: string;
	isResource: boolean;
	pomodoro: Pomodoro;
}
