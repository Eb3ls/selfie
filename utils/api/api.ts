import {
	IdArrayFields,
	IdFields,
	IdOrNullFields,
	generateMessageResponse,
	generateObjectResponse,
	stringsToObjectId
} from "@/utils/api/common";
import {
	USER_COLLECTION,
	User,
	createActivity,
	createAlarm,
	createChat,
	createEvent,
	createGroupChat,
	createMessage,
	createNote,
	createPhase,
	createPomodoro,
	createProject,
	createSession,
	createUser,
	findCollectionWrapper,
	getCollection
} from "@/utils/db/db";
import { getSession } from "@/utils/session/session";
import { JWTPayload } from "jose";
import { ObjectId } from "mongodb";
import { Collection } from "mongodb";
import { NextRequest, NextResponse } from "next/server";

export { generateObjectResponse, generateMessageResponse, stringsToObjectId };

// =============================================================
// ===================== Validatori ============================
// =============================================================
// Descrizione: Questa sezione contiene i validatori che vengono utilizzati per verificare la correttezza dei dati.

export function isEmailValid(email: string): boolean {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
}

function isISO8601(dateString: string) {
	const iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/;
	return (
		iso8601Regex.test(dateString) && !isNaN(new Date(dateString).getTime())
	);
}

export function areIdFieldsValid(object: Record<string, any>): boolean {
	// Prendiamo le chiavi dell'oggetto da validare
	const keys = Object.keys(object);

	// Iteriamo su tutti campi dell'oggetto e controlliamo se sono presenti dei campi
	// che dovrebbero essere ObjectId in formato stringa.
	// In base al tipo di campo, controlliamo che sia valido.
	for (const key of keys) {
		if (IdFields.includes(key) && !ObjectId.isValid(object[key])) {
			return false;
		}
		if (IdOrNullFields.includes(key)) {
			if (object[key] !== null && !ObjectId.isValid(object[key])) {
				return false;
			}
		}
		if (IdArrayFields.includes(key)) {
			if (!Array.isArray(object[key])) {
				return false;
			}
			for (const id of object[key]) {
				if (!ObjectId.isValid(id)) {
					return false;
				}
			}
		}
	}

	return true;
}

export function isTemplateValid(toValidate: any, template: any): boolean {
	// Prendiamo le chiavi di toValidate e template
	const keys1 = Object.keys(toValidate).sort();
	const keys2 = Object.keys(template).sort();

	// Se hanno un numero di chiavi diverso non sono uguali
	if (keys1.length !== keys2.length) {
		return false;
	}

	// Verifichiamo per ogni chiave se corrispondono
	for (let i = 0; i < keys1.length; i++) {
		if (keys1[i] !== keys2[i]) {
			// Se i nomi delle chiavi sono diversi, non sono uguali
			return false;
		}
		if (typeof toValidate[keys1[i]] !== typeof template[keys2[i]]) {
			// Se il tipo dei valori è diverso
			if (IdOrNullFields.includes(keys1[i])) {
				// Se è un campo che può essere ObjectId o null
				// ed è effettivamente null, allora sono uguali
				if (toValidate[keys1[i]] !== null) {
					return false;
				}
			} else {
				// Se non è un campo che può essere ObjectId o null
				// allora non sono uguali
				return false;
			}
		}
	}

	return true;
}

export function isTemplateSubset(
	toValidate: any,
	template: any,
	requiredField: string[]
): boolean {
	// Prendiamo le chiavi di toValidate e template
	const keys1 = Object.keys(toValidate).sort();
	const keys2 = Object.keys(template).sort();

	// Controlliamo che ci siano i campi obbligatori
	if (!requiredField.every((field) => keys1.includes(field))) {
		return false;
	}

	// Verifichiamo per ogni chiave se corrispondono
	for (let i = 0; i < keys1.length; i++) {
		if (!keys2.includes(keys1[i])) {
			// Se la chiave non è presente nel template
			return false;
		}
		if (typeof toValidate[keys1[i]] !== typeof template[keys2[i]]) {
			// Se il tipo dei valori è diverso
			if (IdOrNullFields.includes(keys1[i])) {
				// Se è un campo che può essere ObjectId o null
				// ed è effettivamente null, allora sono uguali
				if (toValidate[keys1[i]] !== null) {
					return false;
				}
			} else {
				// Se non è un campo che può essere ObjectId o null
				// allora non sono uguali
				return false;
			}
		}
	}

	return true;
}

export async function validate<T>(
	request: NextRequest,
	requestTemplate: Object,
	onlySubset: boolean,
	subsetFields: string[] = []
): Promise<{
	user: { _id: string; username: string; password: string };
	body: T;
} | null> {
	// Prendiamo i cookie della richiesta
	const cookies: JWTPayload | null = await getSession(request.cookies);

	if (cookies === null) {
		// Se non c'è la sessione (Non dovrebbe mai succedere visto che il middleware dovrebbe bloccare la richiesta)
		return null;
	}

	let user: { _id: string; username: string; password: string } =
		cookies.user as any;

	// Convertiamo in JSON il body della richiesta
	const body: any | undefined = await parseJSONInput(request);
	if (body === undefined) {
		return null;
	}

	// Controlliamo che il body abbia tutti i campi necessari
	if (onlySubset) {
		// Se è necessario solo un sottoinsieme del template
		if (!isTemplateSubset(body, requestTemplate, subsetFields)) {
			return null;
		}
	} else {
		// Se è necessario tutto il template
		if (!isTemplateValid(body, requestTemplate)) {
			return null;
		}
	}

	// Controlliamo che i campi ObjectId siano validi
	if (!areIdFieldsValid(body)) {
		return null;
	}

	return { user: user, body: body };
}

// =============================================================
// ===================== Convertitori ==========================
// =============================================================
// Descrizione: Questa sezione contiene i convertitori che vengono utilizzati per convertire i dati da un formato all'altro.

export async function parseJSONInput(
	request: Request
): Promise<any | undefined> {
	// if is a GET request
	if (request.method === "GET") {
		return {};
	}
	try {
		return await request.json();
	} catch (e) {
		return undefined;
	}
}

export function fromModelToStringModel<T, P>(model: T): P {
	return JSON.parse(JSON.stringify(model)) as P;
}

export function removeArrayDuplicates<T>(array: T[]) {
	const set = new Set(array);
	return Array.from(set);
}

export function getArrayIntersection(array1: [], array2: []) {
	return array1.filter((value) => array2.includes(value));
}

export async function usernameListToIds(
	usernameList: string[],
	sender: string,
	toAddSender: boolean = true
): Promise<NextResponse> {
	// Iteriamo su usernameList per convertire ogni username in un ObjectId in formato stringa
	const userIds: string[] = [];
	const usersError: string[] = [];

	const client: Collection<User> = await getCollection<User>(USER_COLLECTION);

	usernameList = removeArrayDuplicates(usernameList);

	for (const username of usernameList) {
		// Controlliamo che l'utente esista
		const out = await findCollectionWrapper({ username: username }, client);

		if (out.status === 500) {
			return out;
		} else if (out.status === 404) {
			usersError.push(username);
		} else {
			userIds.push((await out.json())[0]._id);
		}
	}

	// Ritorniamo la lista di username errati
	if (usersError.length !== 0) {
		return generateObjectResponse({ users: usersError }, 400);
	}

	if (toAddSender) {
		const index = userIds.indexOf(sender);
		if (index !== -1) {
			userIds.splice(index, 1);
		}
		userIds.unshift(sender);
	}

	return generateObjectResponse({ users: userIds }, 200);
}

// =============================================================
// ===================== Generatori ============================
// =============================================================
// Descrizione: Questa sezione contiene i generatori che vengono utilizzati per generare oggetti.

type names =
	| "Activity"
	| "Alarm"
	| "Chat"
	| "Event"
	| "GroupChat"
	| "Message"
	| "Note"
	| "Phase"
	| "Pomodoro"
	| "Project"
	| "Session"
	| "User";

// prettier-ignore
const functionsMap = {
	"Activity": createActivity,
	"Alarm": createAlarm,
	"Chat": createChat,
	"Event": createEvent,
	"GroupChat": createGroupChat,
	"Message": createMessage,
	"Note": createNote,
	"Phase": createPhase,
	"Pomodoro": createPomodoro,
	"Project": createProject,
	"Session": createSession,
	"User": createUser
};

export function generateStringModel<T>(obj: Object, type: names): T {
	const objWithId = stringsToObjectId(obj);
	const createFunction = functionsMap[type];
	const generatedModel = createFunction(objWithId);
	return fromModelToStringModel(generatedModel);
}
