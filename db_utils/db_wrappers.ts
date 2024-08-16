import { NextResponse } from "next/server";
import { Collection, ObjectId } from "mongodb";
import {
	Schema,
	addAndFetchToCollection,
	findInCollection,
	deleteInCollection,
	updateOneAndFetchInCollection,
} from "@/db_utils/db_functions";
import {
	generateMessageResponse,
	generateObjectResponse,
} from "@/api_utils/api_functions";

/*
Canonical usage:
    const result = await addCollectionWrapper(data, client);
    if (result.status !== 200) {
        return result;
    }
    const output = result.json();
*/

export async function addCollectionWrapper<T extends Schema>(
	data: T,
	client: Collection<T>
): Promise<NextResponse> {
	const output = await addAndFetchToCollection(data, client);
	if (output === undefined) {
		return generateMessageResponse("Error from the DB", 500);
	} else if (output === null) {
		return generateMessageResponse(
			"Error from the DB (Should never happen)",
			500
		);
	}
	return generateObjectResponse(output, 200);
}

export async function findCollectionWrapper<T extends Schema>(
	data: Object,
	client: Collection<T>
): Promise<NextResponse> {
	const output = await findInCollection(data, client);
	if (output === undefined) {
		return generateMessageResponse("Error from the DB", 500);
	} else if (output.length === 0) {
		return generateMessageResponse("No data found", 404);
	}
	return generateObjectResponse(output, 200);
}

export async function deleteCollectionWrapper<T extends Schema>(
	data: ObjectId,
	client: Collection<T>
): Promise<NextResponse> {
	const output = await deleteInCollection(data, client);
	if (output === undefined) {
		return generateMessageResponse("Error from the DB", 500);
	} else if (output === 0) {
		return generateMessageResponse("No data found", 404);
	}
	return generateMessageResponse("Data deleted", 200);
}

export async function updateOneCollectionWrapper<T extends Schema>(
	_id: ObjectId,
	data: T,
	client: Collection<T>
): Promise<NextResponse> {
	const output = await updateOneAndFetchInCollection(_id, data, client);
	if (output === undefined) {
		return generateMessageResponse("Error from the DB", 500);
	} else if (output === null) {
		return generateMessageResponse("No data found", 404);
	}
	return generateObjectResponse(output, 200);
}
