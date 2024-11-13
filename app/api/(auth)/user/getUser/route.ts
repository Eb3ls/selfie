import {
	generateMessageResponse,
	generateObjectResponse,
	validate
} from "@/utils/api/api";
import {
	PomodoroSettings,
	StringUser,
	USER_COLLECTION,
	User,
	findCollectionWrapper,
	getCollection
} from "@/utils/db/db";
import { Collection } from "mongodb";
import { NextRequest } from "next/server";

type ReducedUser = {
	_id: string;
	username: string;
	firstName: string;
	lastName: string;
	email: string;
	birthDay: string;
	userStatus: string;
	profilePic: string;
	pomodoro: PomodoroSettings;
};

export const GET = async (request: NextRequest) => {
	// Validazione della richiesta
	const validation = await validate<{}>(request, {}, false);

	// Se la validazione fallisce, ritorna il messaggio di errore
	if (validation === null) {
		return generateMessageResponse("Invalid request", 400);
	}

	// Estraiamo l'utente e il corpo della richiesta
	const { user: user, body: newBody } = validation;

	// Estraggo l'id dell'utente
	const userId: string = user._id!;

	// Otteniamo la collezione degli utenti
	const userClient: Collection<User> =
		await getCollection<User>(USER_COLLECTION);

	// Otteniamo l'utente richiesto
	const outUser = await findCollectionWrapper<User>(
		{ _id: userId } as any,
		userClient
	);

	if (outUser.status !== 200) {
		// Se c'è stato un errore, ritorna un errore
		return outUser;
	}

	const userObj: StringUser = (await outUser.json())[0];

	const response: ReducedUser = {
		_id: userObj._id!,
		username: userObj.username,
		firstName: userObj.firstName,
		lastName: userObj.lastName,
		email: userObj.email,
		birthDay: userObj.birthDay,
		userStatus: userObj.userStatus,
		profilePic: userObj.profilePic,
		pomodoro: userObj.pomodoro
	};

	return generateObjectResponse(response, 200);
};
