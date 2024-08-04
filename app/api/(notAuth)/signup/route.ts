import { NextResponse } from "next/server";

import { Collection } from "mongodb";
import { getUsersCollection } from "@/db_utils/db_functions";
import { User } from "@/db_utils/models/User";

export const POST = async (request: Request) => {
	const body = await request.json();
	const username: string = body.username;

	// Add the new user to the database
	const client: Collection<User> = await getUsersCollection();
	const newUser: User = {
		username: username,
	};
	client.insertOne(newUser);

	// Return Ok with status 200
	return new NextResponse("User " + username + " signed up", {
		status: 200,
	});
};
