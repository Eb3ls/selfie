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
	"$all"
];

export { IdFields, IdOrNullFields, IdArrayFields };

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
			if (!Array.isArray(object[key])) {
				// Se non è un array, probabilmente è un oggetto di query
				// Quindi iteriamo su tutti i campi interni e convertiamoli
				const insideKeys = Object.keys(object[key]);
				for (const insideKey of insideKeys) {
					if (!QueryFields.includes(insideKey)) {
						// Se non è un operatore di query, allora è un campo normale,
						// ma questo può accadere solo se c'è un errore nella query!
						console.warn("Cannot convert field to ObjectId!");
						console.warn("Key:", insideKey);
						console.warn("Field: ", object[key][insideKey]);
						throw new Error("Cannot convert field to ObjectId!");
					}
					const one = stringsToObjectId({
						userIdList: object[key][insideKey]
					});
					object[key][insideKey] = one.userIdList;
				}
			} else {
				object[key] = object[key].map((id: string) => new ObjectId(id));
			}
		}
	}

	return object;
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
