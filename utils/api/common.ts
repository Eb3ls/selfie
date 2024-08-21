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
			object[key] = object[key].map((id: string) => new ObjectId(id));
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
