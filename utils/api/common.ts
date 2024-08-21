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
