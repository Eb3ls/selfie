import { NextRequest } from "next/server";
import { Collection, WithId } from "mongodb";
import {
	getCollection,
	USER_COLLECTION,
	findInCollection,
} from "@/db_utils/db_functions";

import { User } from "@/db_utils/models/User";
import {
	parseJSONInput,
	generateMessageResponse,
	isTemplateValid,
} from "@/api_utils/api_functions";

import crypto from "crypto";
import { login } from "@/session_utils/session";

const requestTemplate: Partial<User> = {
	username: "",
	password: "",
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

	// Ottieniamo la collezione degli utenti
	const client: Collection<User> = await getCollection<User>(USER_COLLECTION);

	const castedUser: User = body as User;

	const passwordEncrypted: string = crypto
		.createHash("sha256")
		.update(castedUser.password)
		.digest("hex");

	castedUser.password = passwordEncrypted;

	// Controlliamo se l'utente esiste
	const queryOut: WithId<User>[] | undefined = await findInCollection<User>(
		{ username: castedUser.username },
		client
	);
	if (queryOut === undefined) {
		return generateMessageResponse("Error while trying to check user", 400);
	} else if (queryOut.length === 0) {
		return generateMessageResponse("User not found", 400);
	}

	// Se arriviamo qua significa che lo abbiamo trovato
	if (queryOut[0].password !== castedUser.password) {
		return generateMessageResponse("Wrong password", 400);
	}

	const resp = generateMessageResponse("User found", 200);

	// Impostiamo i cookie
	login(
		queryOut[0]._id,
		castedUser.username,
		passwordEncrypted,
		resp.cookies
	);

	return resp;
};
