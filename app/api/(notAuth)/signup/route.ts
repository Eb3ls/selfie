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
		firstName: "",
		lastName: "",
		email: "",
		password: "",
		birthDay: new Date(),
		userStatus: "",
		profilePic: "",
		isResource: false,
		pomodoro: {
			cycles: 0,
			cyclesCompleted: 0,
			studyDuration: 0,
			breakDuration: 0,
			alarms: [],
		},
	};
	client.insertOne(newUser);

	const response: Object = {
		message: "User " + username + " signed up",
	};

	// Return Ok with status 200
	return new NextResponse(JSON.stringify(response), {
		status: 200,
	});
};
