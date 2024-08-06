import { ObjectId } from "mongodb";
import { createPomodoro, Pomodoro } from "@/db_utils/models/Pomodoro";

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

export function createUser({
	username = "",
	firstName = "",
	lastName = "",
	email = "",
	password = "",
	birthDay = new Date(),
	userStatus = "Attivo",
	profilePic = "/images/?.png",
	isResource = false,
	pomodoro = createPomodoro({}),
}: Partial<User>): User {
	return {
		username: username,
		firstName: firstName,
		lastName: lastName,
		email: email,
		password: password,
		birthDay: birthDay,
		userStatus: userStatus,
		profilePic: profilePic,
		isResource: isResource,
		pomodoro: pomodoro,
	};
}
