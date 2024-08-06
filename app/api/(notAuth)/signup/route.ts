import { NextRequest } from "next/server";
import { Collection, WithId } from "mongodb";
import {
	getCollection,
	USER_COLLECTION,
	addToCollection,
	findInCollection,
} from "@/db_utils/db_functions";

import { User, createUser } from "@/db_utils/models/User";
import {
	parseJSONInput,
	generateMessageResponse,
	isTemplateValid,
} from "@/api_utils/api_functions";

import crypto from "crypto";

const requestTemplate: Partial<User> = {
	username: "",
	password: "",
	firstName: "",
	lastName: "",
	email: "",
};

export const POST = async (request: NextRequest) => {
	// Convertiamo in JSON il body della richiesta
	const body: Object | undefined = await parseJSONInput(request);
	if (body === undefined) {
		return generateMessageResponse("Invalid input", 400);
	}

	// Controlliamo che il body abbia tutti i campi necessari
	if (!isTemplateValid(body, requestTemplate)) {
		return generateMessageResponse("Invalid input", 400);
	}

	// Creaiamo un nuovo utente con quei campi
	const newUser: User = createUser(body);

	// Ottieniamo la collezione degli utenti
	const client: Collection<User> = await getCollection<User>(USER_COLLECTION);

	// Controlliamo se l'utente esiste
	const queryOut: WithId<User>[] | undefined = await findInCollection<User>(
		{ username: newUser.username },
		client
	);
	if (queryOut === undefined) {
		return generateMessageResponse("Error while trying to check user", 400);
	} else if (queryOut.length > 0) {
		return generateMessageResponse("User already exists", 400);
	}

	// Se arriviamo qui l'utente non esiste
	const passwordEncrypted: string = crypto
		.createHash("sha256")
		.update(newUser.password)
		.digest("hex");

	newUser.password = passwordEncrypted;

	// Aggiungi il nuovo utente al db
	const ifOut: boolean | undefined = await addToCollection<User>(
		newUser,
		client
	);
	if (ifOut === undefined) {
		return generateMessageResponse("Error with DB connection", 400);
	} else if (!ifOut) {
		return generateMessageResponse(
			"Error while trying to add user (Should never happen)",
			400
		);
	}

	return generateMessageResponse("User created", 200);
};
