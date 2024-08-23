import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";

// Definizione dei campi che dobbiamo verificare essere ObjectId in formato stringa

// Campi che devono essere ObjectId
const IdFields = [
	"_id",
	"ownerId",
	"projectId",
	"parentId",
	"noteId",
	"phaseId"
];

// Campi che possono essere ObjectId o null
const IdOrNullFields = ["parentActivityId"];

// Campi che devono essere array di ObjectId
const IdArrayFields = [
	"userIdList",
	"activityIdList",
	"prevIdList",
	"nextIdList"
];

const QueryFields = [
	"$eq",
	"$ne",
	"$gt",
	"$gte",
	"$lt",
	"$lte",
	"$in",
	"$nin",
	"$and",
	"$or",
	"$not",
	"$nor",
	"$all",
	"$pull"
];

export { IdFields, IdOrNullFields, IdArrayFields };

function diveArray(array: any[], fromIdField: boolean): any[] {
	const outArray = [];

	for (let i = 0; i < array.length; i++) {
		if (typeof array[i] === "string") {
			if (fromIdField) {
				outArray.push(new ObjectId(array[i] as string));
			} else {
				outArray.push(array[i]);
			}
		} else if (Array.isArray(array[i])) {
			outArray.push(diveArray(array[i], fromIdField));
		} else if (typeof array[i] === "object") {
			outArray.push(stringsToObjectId(array[i], fromIdField));
		} else {
			outArray.push(array[i]);
		}
	}

	return outArray;
}

export function stringsToObjectId(
	object: any,
	fromIdField: boolean = false
): any {
	const outObject = {} as any;
	const keys = Object.keys(object);

	for (const key of keys) {
		if (IdFields.includes(key)) {
			// Se è un campo che deve essere ObjectId, lo convertiamo
			outObject[key] = new ObjectId(object[key] as string);
		} else if (IdOrNullFields.includes(key)) {
			// Se è un campo che deve essere ObjectId o null
			if (outObject[key] !== null) {
				// Se non è null, lo convertiamo
				outObject[key] = new ObjectId(object[key] as string);
			}
		} else if (IdArrayFields.includes(key)) {
			// Se è un campo che deve essere un array di ObjectId
			if (Array.isArray(object[key])) {
				// Se è un array chiamiamo diveArray, sapendo che proveniamo da un campo che deve essere ObjectId
				outObject[key] = diveArray(object[key], true);
			} else {
				// Se è un oggetto chiamiamo stringsToObjectId, sapendo che proveniamo da un campo che deve essere ObjectId
				outObject[key] = stringsToObjectId(object[key], true);
			}
		} else if (QueryFields.includes(key)) {
			// Se è un campo di query
			if (Array.isArray(object[key])) {
				// Se è un array chiamiamo diveArray, passando il campo da cui proveniamo
				outObject[key] = diveArray(object[key], fromIdField);
			} else if (typeof object[key] === "object") {
				// Se è un oggetto chiamiamo stringsToObjectId, passando il campo da cui proveniamo
				outObject[key] = stringsToObjectId(object[key], fromIdField);
			} else {
				// Se è una stringa, la convertiamo in ObjectId se proveniamo da un campo che deve essere ObjectId
				if (fromIdField) {
					outObject[key] = new ObjectId(object[key]);
				} else {
					outObject[key] = object[key];
				}
			}
		} else {
			// Se è un campo di nessuna rilevanza
			if (Array.isArray(object[key])) {
				// Se è un array chiamiamo diveArray, passando che non proveniamo da un campo che deve essere ObjectId
				outObject[key] = diveArray(object[key], false);
			} else if (
				typeof object[key] === "object" &&
				object[key] !== null
			) {
				// Se è un oggetto chiamiamo stringsToObjectId, passando che non proveniamo da un campo che deve essere ObjectId
				outObject[key] = stringsToObjectId(object[key], false);
			} else {
				// Se è una stringa, la manteniamo così com'è
				outObject[key] = object[key];
			}
		}
	}

	return outObject;
}

export function generateMessageResponse(payload: string, status: number) {
	return new NextResponse(JSON.stringify({ message: payload }), {
		status: status
	});
}

export function generateObjectResponse(payload: Object, status: number) {
	return new NextResponse(JSON.stringify(payload), {
		status: status
	});
}
