import {
	generateMessageResponse,
	generateObjectResponse,
	isEmailValid,
	validate
} from "@/utils/api/api";
import {
	StringUser,
	USER_COLLECTION,
	User,
	findCollectionWrapper,
	getCollection,
	updateCollectionWrapper
} from "@/utils/db/db";
import crypto from "crypto";
import { Collection } from "mongodb";
import { NextRequest } from "next/server";

const requestTemplate = {
	username: "",
	firstName: "",
	lastName: "",
	email: "",
	password: "",
	oldPassword: "",
	birthDay: "",
	previews: {
		calendar: {
			activity: true,
			event: true,
			session: true,
			projectActivity: true,
			maxOccurrences: 10
		},
		maxChats: 10,
		maxNotes: 10
	}
};

type RequestType = typeof requestTemplate;

export const PATCH = async (request: NextRequest) => {
	// Validazione della richiesta
	const validation = await validate<RequestType>(
		request,
		requestTemplate,
		false
	);

	// Se la validazione fallisce, ritorna il messaggio di errore
	if (validation === null) {
		return generateMessageResponse("Invalid request", 400);
	}

	console.log("Validation passed");

	// Estraiamo l'utente e il corpo della richiesta
	const { user: user, body: newBody } = validation;

	if (!isEmailValid(newBody.email)) {
		return generateMessageResponse("Invalid email", 400);
	}

	// Estraiamo l'id dell'utente
	const userId: string = user._id!;

	// Ottieniamo la collezione degli utenti
	const client: Collection<User> = await getCollection<User>(USER_COLLECTION);

	const userOut = await findCollectionWrapper<User>({ _id: userId }, client);

	if (userOut.status !== 200) {
		return generateMessageResponse("User not found", 400);
	}

	const userString: StringUser = (await userOut.json())[0];

	// Creiamo un oggetto con i campi da modificare
	const newFields: Partial<StringUser> = {
		username: newBody.username,
		firstName: newBody.firstName,
		lastName: newBody.lastName,
		email: newBody.email,
		birthDay: newBody.birthDay,
		previews: newBody.previews
	};

	if (
		newBody.password !== "" &&
		newBody.oldPassword !== "" &&
		newBody.oldPassword === userString.password
	) {
		newFields.password = crypto
			.createHash("sha256")
			.update(newBody.password)
			.digest("hex");
	}

	// Modifichiamo l'utente
	const updateOut = await updateCollectionWrapper<User>(
		{ _id: userId },
		{ $set: newFields } as any,
		client
	);

	if (updateOut.status !== 200) {
		return updateOut;
	}

	const updatedUser: StringUser = (await updateOut.json())[0];

	return generateObjectResponse(updatedUser, 200);
};
