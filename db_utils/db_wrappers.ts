import { NextResponse } from "next/server";
import { Collection, ObjectId } from "mongodb";
import {
	Schema,
	StringSchema,
	addAndFetchToCollection,
	findInCollection,
	deleteManyInCollection,
	updateManyAndFetchInCollection,
} from "@/db_utils/db_functions";
import {
	generateMessageResponse,
	generateObjectResponse,
} from "@/api_utils/api_functions";
import { stringsToObjectId } from "@/refactor_utils/refactor_functions";

/*
Canonical usage:
    const result = await addCollectionWrapper(data, client);
    if (result.status !== 200) {
        return result;
    }
    const output = result.json();
*/

export async function addCollectionWrapper<
	T extends StringSchema,
	P extends Schema
>(data: T, client: Collection<P>): Promise<NextResponse> {
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

export async function findCollectionWrapper<
	T extends Partial<StringSchema>,
	P extends Schema
>(data: T, client: Collection<P>): Promise<NextResponse> {
	const output = await findInCollection(stringsToObjectId(data), client);
	if (output === undefined) {
		return generateMessageResponse("Error from the DB", 500);
	} else if (output.length === 0) {
		return generateMessageResponse("No data found", 404);
	}
	return generateObjectResponse(output, 200);
}

export async function deleteCollectionWrapper<
	T extends Partial<StringSchema>,
	P extends Schema
>(data: T, client: Collection<P>): Promise<NextResponse> {
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

export async function updateCollectionWrapper<
	T extends Partial<StringSchema>,
	P extends Schema
>(filter: T, data: T, client: Collection<P>): Promise<NextResponse> {
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
