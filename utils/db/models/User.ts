import { ConvertToString } from "@/utils/db/models/ModelConverter";
import { createPomodoroSettings, PomodoroSettings } from "@/utils/db/models/Pomodoro";
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
	pomodoro: PomodoroSettings;	// Setting iniziale per il pomodoro
	subscriptionList: {
		endpoint: "",
		expirationTime: 0,
		keys: {
			p256dh: "",
			auth: ""
		}
	}[];	// Lista di subscription per le notifiche
	previews: {
		calendar: {
			activity: boolean;			// Se l'utente vuole vedere le attività
			event: boolean;				// Se l'utente vuole vedere gli eventi
			session: boolean;			// Se l'utente vuole vedere le sessioni
			projectActivity: boolean;	// Se l'utente vuole vedere le attività dei progetti
			maxOccurrences: number;		// Numero massimo di occorrenze da mostrare
		}
		maxChats: number;				// Numero massimo di chat
		maxNotes: number;				// Numero massimo di note
	};
	alarmPreferences: {
		email: boolean;
		push: boolean;
	}
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
	pomodoro = createPomodoroSettings({}),
	subscriptionList = [],
	previews = {
		calendar: {
			activity: true,
			event: true,
			session: true,
			projectActivity: true,
			maxOccurrences: 10
		},
		maxChats: 10,
		maxNotes: 10
	},
	alarmPreferences = {
		email: true,
		push: true
	}
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
		subscriptionList: subscriptionList,
		previews: previews,
		alarmPreferences: alarmPreferences
	};
}
