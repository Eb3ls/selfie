import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { User } from "@/db_utils/models/User";
import { getSession } from "@/session_utils/session";
import { JWTPayload } from "jose";

export async function parseJSONInput(
	request: Request
): Promise<any | undefined> {
	try {
		return await request.json();
	} catch (e) {
		return undefined;
	}
}

export function isValidEmail(email: string): boolean {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
}

/*
Parametri:
	dateString: stringa da controllare
Valore di Ritorno:
	BOOLEAN:
		true: dateString è una stringa ISO 8601 valida
		false: dateString non è una stringa ISO 8601 valida
Descrizione:
	Funzione ausiliaria che controlla se una stringa è ISO 8601. Il controllo serve a creare un oggetto Date
*/
function isISO8601(dateString: string) {
	const iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/;
	return (
		iso8601Regex.test(dateString) && !isNaN(new Date(dateString).getTime())
	);
}

/*
Parametri:
	obj: oggetto con dei campi stringhe da convertire in oggetti
Valore di Ritorno:
	OBJECT:
		Nuovo oggetto con campi convertiti
Descrizione:
	Funzione che converte determinate stringhe in determinati oggetti. Es data in oggetto Date
	o stringa di ObjectId in ObjectId. La conversione serve a inserire correttamente gli oggetti nel db.
*/
export function stringsToObjects(obj: Object): Object {
	const keys = Object.keys(obj);
	let object: any = { ...obj };

	for (let i = 0; i < keys.length; i++) {
		// Controllo data
		if (isISO8601(object[keys[i]])) {
			object[keys[i]] = object[keys[i]] = new Date(object[keys[i]]);
		} else if (
			ObjectId.isValid(object[keys[i]]) &&
			typeof object[keys[i]] === "string"
		) {
			object[keys[i]] = ObjectId.createFromHexString(object[keys[i]]);
		}
	}

	return object;
}

/*
Parametri:
	obj: oggetto da verificare
	template: template su cui verificare l'oggetto
Valore di Ritorno:
	BOOLEAN:
		true: obj è della stessa struttura di template
		false: obj non è della stessa struttura di template
Descrizione: 
	Funzione che verifica se l'oggetto obj è della stessa struttura di template, per campi e tipo dei campi
*/
export function isTemplateValid(obj: Object, template: Object): boolean {
	// Prendo le chiavi di obj e template
	const keys1 = Object.keys(obj).sort();
	const keys2 = Object.keys(template).sort();

	// Se hanno un numero di chiavi diverso non sono uguali
	if (keys1.length !== keys2.length) {
		return false;
	}

	// Comodo per usare any o si hanno problemi nell'accesso alle chiavi
	const ob: any = { ...obj };
	const temp: any = { ...template };

	// Verifico per ogni chiave, sono ordinate quindi so che allo stesso indice c'è la stessa chiave
	for (let i = 0; i < keys1.length; i++) {
		// Se ho nomi delle chiavi diverso o tipi dei valori diversi, non sono uguali
		if (
			keys1[i] !== keys2[i] || // Nomi delle chiavi
			typeof ob[keys1[i]] !== typeof temp[keys2[i]] // Tipi dei valori
		) {
			return false;
		}
	}

	return true;
}

/*
Parametri: 
	obj: oggetto da verificare
	template: template su cui verificare l'oggetto
	requiredField: campo obbligatorio (di solito _id)
Valore di Ritorno:
	BOOLEAN:
		true: obj è un sottoinsieme di template e il campo obbligatorio è presente
		false: obj non è un sottoinsieme di template o il campo obbligatorio è assente
Descrizione:
	La funzione verifica se obj è un sottoinsieme di template. È utile per le modify (es. activity e event).
	Per essere validato, obj deve avere almeno il campo obligatorio denotato da requiredField.
*/
export function isTemplateSubset(
	obj: Object,
	template: Object,
	requiredField: string
): boolean {
	// Prendi le chiavi di obj e template
	const keys1 = Object.keys(obj).sort();
	const keys2 = Object.keys(template).sort();

	// Se c'è il campo obbligatorio fai un controllo a riguardo
	if (requiredField !== "") {
		// Verifica se il campo obbligatorio è presente sia in obj che in template
		if (!keys1.includes(requiredField) || !keys2.includes(requiredField)) {
			return false;
		}
	}

	// Copio perchè è utile any
	const ob: any = { ...obj };
	const temp: any = { ...template };

	// Verifica che tutti i campi di obj appartengono a template e che siano dello stesso tipo
	for (let i = 0; i < keys1.length; i++) {
		// Controllo che il campo i di obj sia presente in template
		if (!keys2.includes(keys1[i])) {
			return false;
		}

		// Controllo che i tipi siano uguali
		for (let j = 0; j < keys2.length; j++) {
			if (keys1[i] === keys2[j]) {
				if (typeof ob[keys1[i]] !== typeof temp[keys2[j]]) {
					return false;
				}
			}
		}
	}

	return true;
}

/*
Parametri: 
	request: richiesta ricevuta
	requestTemplate: template su cui verificare l'oggetto
	needForConversion: se è necessario avviare la conversione di stringhe in oggetti (es. date in oggetto Date)
	onlySubset: se è necessario solo un sottoinsieme del template
Valore di Ritorno:
	OBJECT:
		user: utente che ha fatto la richiesta
		body: corpo della richiesta convertito
	NULL: richiesta fallita
Descrizione:
	La funzione standardValidation è una funzione di validazione standard per le richieste. 
	Controlla se l'utente che ha fatto la richiesta è loggato ed esegue le conversioni opportune.
	Successivamente controlla se il corpo della richiesta è conforme al template richiesto.
	Se la richiesta è conforme, ritorna un oggetto con l'utente e il corpo della richiesta.
*/
export async function standardValidation<T>(
	request: NextRequest,
	requestTemplate: Object,
	needForConversion: boolean = false,
	onlySubset: boolean = false
): Promise<{ user: Partial<User>; body: T } | null> {
	// Prendiamo i cookie della richiesta
	const cookies: JWTPayload | null = await getSession(request.cookies);

	if (cookies === null) {
		// Se non c'è la sessione (Non dovrebbe mai succedere visto che il middleware dovrebbe bloccare la richiesta)
		return null;
	}

	let user: Partial<User> = cookies.user as Partial<User>;

	// Convertiamo l'ID dell'utente in ObjectId
	try {
		user._id = ObjectId.createFromHexString(user._id! as any);
	} catch (e: any) {
		return null;
	}

	// Convertiamo in JSON il body della richiesta
	const body: any | undefined = await parseJSONInput(request);
	if (body === undefined) {
		return null;
	}

	// Conversione del body
	let newBody = { ...body };
	if (needForConversion) {
		newBody = stringsToObjects(body);
	}

	// Controlliamo che il body abbia tutti i campi necessari
	if (onlySubset) {
		// Se è necessario solo un sottoinsieme del template
		if (!isTemplateSubset(newBody, requestTemplate, "_id")) {
			return null;
		}
	} else {
		// Se è necessario tutto il template
		if (!isTemplateValid(newBody, requestTemplate)) {
			return null;
		}
	}

	return { user: user, body: newBody };
}

export function generateMessageResponse(payload: string, status: number) {
	return new NextResponse(JSON.stringify({ message: payload }), {
		status: status,
	});
}

export function generateObjectResponse(payload: Object, status: number) {
	return new NextResponse(JSON.stringify(payload), {
		status: status,
	});
}
