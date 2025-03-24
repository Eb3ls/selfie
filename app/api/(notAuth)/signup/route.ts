import { DEFAULT_PROFILE_URL } from "@/app/constants";
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
import { decrypt } from "@/utils/session/session";
import crypto from "crypto";
import { Collection } from "mongodb";
import { NextRequest } from "next/server";

const requestTemplate = {
	username: "",
	password: "",
	firstName: "",
	lastName: "",
	email: "",
	emailToken: ""
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

	// Verifichiamo che l'email all'interno del token sia uguale a quella nel body
	try {
		// Verifichiamo il token
		const token: string = body.emailToken;
		const payload = await decrypt(token);

		if (payload.email !== body.email) {
			return generateMessageResponse("Invalid token", 400);
		}
	} catch (e) {
		return generateMessageResponse("Invalid token", 400);
	}

	// Rimuoviamo il campo emailToken dal body
	const { emailToken, ...newBody } = body;

	// Creaiamo un nuovo utente con quei campi
	const newUser: StringUser = generateStringModel(newBody, "User");

	// Aggiungo profilePic di default
	newUser.profilePic = DEFAULT_PROFILE_URL;

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
