import { ObjectId } from "mongodb";
import { createPomodoro, Pomodoro } from "@/db_utils/models/Pomodoro";

/*
COLLECTION
*/

export interface User {
	_id?: ObjectId; 		// ID dell'utente
	username: string;
	firstName: string;
	lastName: string;
	email: string;
	password: string;
	birthDay: Date;
	userStatus: string; 	// Attivo, Disattivo
	profilePic: string; 	// path dell'immagine di profilo
	isResource: boolean; 	// Se l'utente è una risorsa - es. un luogo specifico
	pomodoro: Pomodoro; 	// Setting iniziale per il pomodoro
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
