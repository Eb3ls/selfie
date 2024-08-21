import {
	generateMessageResponse,
	generateObjectResponse,
	stringsToObjectId
} from "@/utils/api/common";
import {
	Schema,
	addAndFetchToCollection,
	deleteManyInCollection,
	findInCollection,
	updateManyAndFetchInCollection
} from "@/utils/db/db_functions";
import { ConvertToString } from "@/utils/db/models/ModelConverter";
import { Collection, ObjectId } from "mongodb";
import { NextResponse } from "next/server";

/*
Canonical usage:
    const result = await addCollectionWrapper(data, client);
    if (result.status !== 200) {
        return result;
    }
    const output = result.json();
*/

export async function addCollectionWrapper<T extends Schema>(
	data: ConvertToString<T>,
	client: Collection<T>
): Promise<NextResponse> {
	const output = await addAndFetchToCollection(
		stringsToObjectId(data),
		client
	);
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
	data: Partial<ConvertToString<T>>,
	client: Collection<T>
): Promise<NextResponse> {
	const output = await findInCollection(stringsToObjectId(data), client);
	if (output === undefined) {
		return generateMessageResponse("Error from the DB", 500);
	} else if (output.length === 0) {
		return generateMessageResponse("No data found", 404);
	}
	return generateObjectResponse(output, 200);
}

export async function deleteCollectionWrapper<T extends Schema>(
	data: Partial<ConvertToString<T>>,
	client: Collection<T>
): Promise<NextResponse> {
	const output = await deleteManyInCollection(
		stringsToObjectId(data),
		client
	);
	if (output === undefined) {
		return generateMessageResponse("Error from the DB", 500);
	} else if (output === 0) {
		return generateMessageResponse("No data found", 404);
	}
	return generateMessageResponse("Data deleted", 200);
}

export async function updateCollectionWrapper<T extends Schema>(
	filter: Partial<ConvertToString<T>>,
	data: Partial<ConvertToString<T>>,
	client: Collection<T>
): Promise<NextResponse> {
	const output = await updateManyAndFetchInCollection(
		stringsToObjectId(filter),
		stringsToObjectId(data),
		client
	);
	if (output === undefined) {
		return generateMessageResponse("Error from the DB", 500);
	} else if (output === null) {
		return generateMessageResponse("No data found", 404);
	}
	return generateObjectResponse(output, 200);
}
