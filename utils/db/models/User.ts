import { ConvertToString } from "@/utils/db/models/ModelConverter";
import { Pomodoro, createPomodoro } from "@/utils/db/models/Pomodoro";
import { ObjectId } from "mongodb";

/*
COLLECTION
*/

export interface User {
	_id?: ObjectId;				// ID dell'utente
	username: string;
	firstName: string;
	lastName: string;
	email: string;
	password: string;
	birthDay: Date | null;		// Se non messa è null, altrimenti l'utente sarebbe nato il giorno del signup
	userStatus: string;			// Attivo, Disattivo
	profilePic: string;			// Path dell'immagine di profilo
	isResource: boolean;		// Se l'utente è una risorsa - es. un luogo specifico
	pomodoro: Pomodoro;			// Setting iniziale per il pomodoro
}

export type StringUser = ConvertToString<User>;

export function createUser({
	username = "",
	firstName = "",
	lastName = "",
	email = "",
	password = "",
	birthDay = null,
	userStatus = "Attivo",
	profilePic = "/images/?.png",
	isResource = false,
	pomodoro = createPomodoro({})
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
		pomodoro: pomodoro
	};
}
