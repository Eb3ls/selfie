import {
	generateMessageResponse,
	generateStringModel,
	isEmailValid,
	isTemplateValid,
	parseJSONInput
} from "@/utils/api/api";
import {
	StringUser,
	USER_COLLECTION,
	User,
	addCollectionWrapper,
	findCollectionWrapper,
	getCollection
} from "@/utils/db/db";
import crypto from "crypto";
import { Collection } from "mongodb";
import { NextRequest } from "next/server";

const requestTemplate = {
	username: "",
	password: "",
	firstName: "",
	lastName: "",
	email: ""
};

type RequestType = typeof requestTemplate;

export const POST = async (request: NextRequest) => {
	// Convertiamo in JSON il body della richiesta
	const body: RequestType | undefined = await parseJSONInput(request);
	if (body === undefined) {
		return generateMessageResponse("Invalid input", 400);
	}

	// Controlliamo che il body abbia tutti i campi necessari
	if (!isTemplateValid(body, requestTemplate)) {
		return generateMessageResponse("Invalid input", 400);
	}

	if (!isEmailValid(body.email)) {
		return generateMessageResponse("Invalid email", 400);
	}

	// Creaiamo un nuovo utente con quei campi
	const newUser: StringUser = generateStringModel(body, "User");

	const passwordEncrypted: string = crypto
		.createHash("sha256")
		.update(newUser.password)
		.digest("hex");

	newUser.password = passwordEncrypted;

	// Ottieniamo la collezione degli utenti
	const client: Collection<User> = await getCollection<User>(USER_COLLECTION);

	const userOut = await findCollectionWrapper<User>(
		{ username: newUser.username },
		client
	);

	if (userOut.status === 200) {
		return generateMessageResponse("Username already exists", 400);
	}

	// Se arriviamo qui l'utente non esiste, quindi possiamo crearlo

	return addCollectionWrapper<User>(newUser, client);
};
