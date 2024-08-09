import { NextRequest } from "next/server";
import { Collection, ObjectId, WithId } from "mongodb";
import { Pomodoro } from "@/db_utils/models/Pomodoro";
import { User } from "@/db_utils/models/User";
import {
	parseJSONInput,
	generateMessageResponse,
	isTemplateValid,
	generateObjectResponse,
	stringsToObjects,
} from "@/api_utils/api_functions";
import { JWTPayload } from "jose";
import { getSession } from "@/session_utils/session";
import {
	getCollection,
	USER_COLLECTION,
	updateOneAndFetchInCollection,
} from "@/db_utils/db_functions";

const requestTemplate: Partial<Pomodoro> = {
	_id: new ObjectId(),
	cycles: 4,
	cyclesCompleted: 0,
	studyDuration: 25,
	breakDuration: 5,
};

export const PATCH = async (request: NextRequest) => {
	// Prendiamo i cookie della richiesta
	const cookies: JWTPayload = (await getSession(
		request.cookies
	)) as JWTPayload; // Assumiamo che la sessione sia stata validata dal middleware

	const owner: any = cookies.user as Partial<User>;
	const userId: ObjectId = ObjectId.createFromHexString(owner._id);

	// Convertiamo in JSON il body della richiesta
	const body: Object | undefined = await parseJSONInput(request);
	if (body === undefined) {
		return generateMessageResponse("Invalid input", 400);
	}

	// Cambio le stringhe date in oggetti Date
	const newBody: any = stringsToObjects(body);

	// Controlliamo che il body abbia tutti i campi necessari
	if (!isTemplateValid(newBody, requestTemplate)) {
		return generateMessageResponse("Invalid input", 400);
	}

	const { ...pomodoro } = newBody as Pomodoro;
	// Creo il pomodoro da inserire
	const pomodoroObject: any = { pomodoro: pomodoro };

	// Ottieniamo la collezione degli utenti
	const client: Collection<User> = await getCollection<User>(USER_COLLECTION);

	// Aggiorno l'utente col pomodoro
	const modifiedUser: WithId<User> | undefined | null =
		await updateOneAndFetchInCollection<User>(
			userId,
			pomodoroObject,
			client
		);

	if (modifiedUser === undefined) {
		return generateMessageResponse("Error in database", 400);
	} else if (modifiedUser === null) {
		return generateMessageResponse("User not found", 400);
	}

	return generateObjectResponse(modifiedUser.pomodoro, 200);
};
