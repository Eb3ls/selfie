import {
	generateObjectResponse,
	parseJSONInput,
} from "@/api_utils/api_functions";
import { USER_COLLECTION, getCollection } from "@/db_utils/db_functions";
import { findCollectionWrapper } from "@/db_utils/db_wrappers";
import { User } from "@/db_utils/models/User";
import { getSession } from "@/session_utils/session";
import { JWTPayload } from "jose";
import { Collection, ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";

const IdFields = [
	"_id",
	"ownerId",
	"projectId",
	"parentId",
	"noteId",
	"phaseId",
];

const IdOrNullFields = ["parentActivityId"];

const IdArrayFields = [
	"userIdList",
	"activityIdList",
	"prevIdList",
	"nextIdList",
];

export function fromModelToStringModel<T, P>(model: T): P {
	return JSON.parse(JSON.stringify(model)) as P;
}

export function removeArrayDuplicates<T>(array: T[]) {
	const set = new Set(array);
	return Array.from(set);
}

export function areIdFieldsValid(object: Record<string, any>): boolean {
	const keys = Object.keys(object);

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

export function stringsToObjectId(object: any): any {
	const keys = Object.keys(object);

	for (const key of keys) {
		if (IdFields.includes(key)) {
			object[key] = new ObjectId(object[key] as string);
		}
		if (IdOrNullFields.includes(key)) {
			if (object[key] !== null) {
				object[key] = new ObjectId(object[key] as string);
			}
		}
		if (IdArrayFields.includes(key)) {
			object[key] = object[key].map((id: string) => new ObjectId(id));
		}
	}

	return object;
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
		// Se ci sono nomi di chiavi diversi o tipi dei valori diversi, non sono uguali
		if (
			keys1[i] !== keys2[i] || // Nomi delle chiavi
			typeof toValidate[keys1[i]] !== typeof template[keys2[i]] // Tipi dei valori
		) {
			return false;
		}
	}

	return true;
}

export function isTemplateSubset(
	toValidate: any,
	template: any,
	requiredField: string[],
): boolean {
	// Prendiamo le chiavi di toValidate e template
	const keys1 = Object.keys(toValidate).sort();
	const keys2 = Object.keys(template).sort();

	// Controlliamo che ci sia il campo obbligatorio
	if (!requiredField.every((field) => keys1.includes(field))) {
		return false;
	}

	// Verifichiamo per ogni chiave se corrispondono
	for (let i = 0; i < keys1.length; i++) {
		if (keys2.includes(keys1[i])) {
			// Se il tipo dei valori è diverso, non sono uguali
			if (
				typeof toValidate[keys1[i]] !== typeof template[keys1[i]] // Tipi dei valori
			) {
				return false;
			}
		} else {
			return false;
		}
	}

	return true;
}

export async function validate<T>(
	request: NextRequest,
	requestTemplate: Object,
	onlySubset: boolean,
	subsetFields: string[] = [],
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

export async function usernameListToIds(
	usernameList: string[],
	sender: string,
	toAddSender: boolean = true,
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
