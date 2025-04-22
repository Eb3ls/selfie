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
import { timeMachine } from "@/utils/timeMachine/timeMachine";
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
	},
	alarmPreferences: {
		email: true,
		push: true
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

	// Estraiamo l'utente e il corpo della richiesta
	const { user: user, body: newBody } = validation;

	if (!isEmailValid(newBody.email)) {
		return generateMessageResponse("Invalid email", 400);
	}

	// Controlliamo che il compleanno non sia una data futura
	const today = new Date(timeMachine.timeMachineTime);
	const birthDate = new Date(newBody.birthDay);
	if (birthDate > today) {
		return generateMessageResponse("Invalid birth date", 400);
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
		previews: newBody.previews,
		alarmPreferences: newBody.alarmPreferences
	};

	if (newBody.password === "" || newBody.oldPassword === "") {
		// Saltiamo la modifica della password
	} else {
		// Controlliamo che la vecchia password sia corretta
		const hash = crypto
			.createHash("sha256")
			.update(newBody.oldPassword)
			.digest("hex");

		if (userString.password !== hash) {
			return generateMessageResponse("Old password is incorrect", 400);
		}

		// Modifichiamo la password
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
