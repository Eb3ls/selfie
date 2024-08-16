import { NextRequest } from "next/server";
import { Collection, ObjectId, WithId } from "mongodb";
import { User } from "@/db_utils/models/User";
import {
	parseJSONInput,
	generateMessageResponse,
	isTemplateSubset,
	isTemplateValid,
	generateObjectResponse,
	stringsToObjects,
	isValidEmail,
} from "@/api_utils/api_functions";
import { JWTPayload } from "jose";
import { getSession } from "@/session_utils/session";
import {
	getCollection,
	USER_COLLECTION,
	updateOneAndFetchInCollection,
} from "@/db_utils/db_functions";
import crypto from "crypto";

const requestTemplate: Partial<User> = {
	username: "",
	firstName: "",
	lastName: "",
	birthDay: new Date(),
};

const requestEmailTemplate: Partial<User> = {
	email: "",
};

const requestPasswordTemplate: Partial<User> = {
	password: "",
};

function isISO8601(dateString: string) {
	const iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/;
	return (
		iso8601Regex.test(dateString) && !isNaN(new Date(dateString).getTime())
	);
}

export const PATCH = async (request: NextRequest) => {
	// Prendiamo i cookie della richiesta
	const cookies: JWTPayload = (await getSession(
		request.cookies
	)) as JWTPayload; // Assumiamo che la sessione sia stata validata dal middleware

	const user: any = cookies.user as Partial<User>;
	const userId: ObjectId = ObjectId.createFromHexString(user._id);

	// Convertiamo in JSON il body della richiesta
	const body: Object | undefined = await parseJSONInput(request);
	if (body === undefined) {
		return generateMessageResponse("Invalid input", 400);
	}

	// Cambio le stringhe date in oggetti Date
	const newBody: any = stringsToObjects(body);

	// Controlliamo che il body abbia tutti i campi necessari
	let choice: string = "";

	if (isTemplateValid(newBody, requestEmailTemplate)) {
		choice = "email";
	} else if (isTemplateValid(newBody, requestPasswordTemplate)) {
		choice = "password";
	} else if (isTemplateSubset(newBody, requestTemplate, "")) {
		choice = "basic";
	}

	if (choice === "") {
		return generateMessageResponse("Invalid input", 400);
	}
	if (choice === "email") {
		// Controlliamo che la mail sia valida
		if (!isValidEmail(newBody.email)) {
			return generateMessageResponse("Invalid email", 400);
		}
	}
	if (choice === "password") {
		// Criptiamo la password

		newBody.password = crypto
			.createHash("sha256")
			.update(newBody.password)
			.digest("hex");
	}

	// Ottieniamo la collezione degli utenti
	const client: Collection<User> = await getCollection<User>(USER_COLLECTION);

	// Aggiorno l'utente col pomodoro
	const modifiedUser: WithId<User> | undefined | null =
		await updateOneAndFetchInCollection<User>(userId, newBody, client);

	if (modifiedUser === undefined) {
		return generateMessageResponse("Error in database", 400);
	} else if (modifiedUser === null) {
		return generateMessageResponse("User not found", 400);
	}

	return generateObjectResponse(modifiedUser, 200);
};
