import {
	generateMessageResponse,
	generateObjectResponse,
	validate
} from "@/utils/api/api";
import {
	Pomodoro,
	StringUser,
	USER_COLLECTION,
	User,
	getCollection,
	updateCollectionWrapper
} from "@/utils/db/db";
import { Collection } from "mongodb";
import { NextRequest } from "next/server";

const requestTemplate = {
	cycles: 0,
	remainingCycles: 0,
	studyDuration: 0,
	breakDuration: 0
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

	// Estraiamo l'id dell'utente
	const userId: string = user._id!;

	// Creiamo un oggetto con i campi da modificare
	const newFields: Partial<Pomodoro> = {
		cycles: newBody.cycles,
		remainingCycles: newBody.remainingCycles,
		studyDuration: newBody.studyDuration,
		breakDuration: newBody.breakDuration
	};

	// Ottieniamo la collezione degli utenti
	const client: Collection<User> = await getCollection<User>(USER_COLLECTION);

	// Modifichiamo l'utente
	const outUser = await updateCollectionWrapper<User>(
		{ _id: userId },
		{ $set: { pomodoro: newFields } } as any,
		client
	);

	if (outUser.status !== 200) {
		return outUser;
	}

	const updatedUser: StringUser = (await outUser.json())[0];

	return generateObjectResponse(updatedUser, 200);
};
