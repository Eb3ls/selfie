import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

export async function parseJSONInput(
	request: Request
): Promise<Object | undefined> {
	try {
		return await request.json();
	} catch (e) {
		return undefined;
	}
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
		if (isISO8601(object[keys[i]])) {
			object[keys[i]] = object[keys[i]] = new Date(object[keys[i]]);
		} else if (ObjectId.isValid(object[keys[i]])) {
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

	// Verifica se il campo obbligatorio è presente sia in obj che in template
	if (!keys1.includes(requiredField) || !keys2.includes(requiredField)) {
		return false;
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
