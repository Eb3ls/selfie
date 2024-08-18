import { NextRequest } from "next/server";
import { Collection, WithId, ObjectId } from "mongodb";
import {
	getCollection,
	USER_COLLECTION,
	PROJECT_COLLECTION,
	findInCollection,
	updateOneAndFetchInCollection,
} from "@/db_utils/db_functions";

import { User } from "@/db_utils/models/User";
import { Project } from "@/db_utils/models/Project";
import {
	parseJSONInput,
	isTemplateSubset,
	generateMessageResponse,
	generateObjectResponse,
	getIdFromUsername,
} from "@/api_utils/api_functions";
import { getSession } from "@/session_utils/session";
import { JWTPayload } from "jose";

const requestTemplate: Partial<Project> = {
	_id: new ObjectId(),
	summary: "",
	userList: [],
};

export const PATCH = async (request: NextRequest) => {
	// Prendiamo i cookie della richiesta
	const cookies: JWTPayload = (await getSession(
		request.cookies
	)) as JWTPayload; // Assumiamo che la sessione sia stata validata dal middleware

	const sender: Partial<User> = cookies.user as Partial<User>;
	// Prendiamo l'id dell'utente che vuole modificare il progetto seguendo l'assunzione
	const senderId: ObjectId = ObjectId.createFromHexString(sender._id! as any);

	// Convertiamo in JSON il body della richiesta
	const body: any | undefined = await parseJSONInput(request);
	if (body === undefined) {
		return generateMessageResponse("Invalid input", 400);
	}

	// body._id da stringa a ObjectId
	body._id = ObjectId.createFromHexString(body._id);

	// Controlliamo che il body abbia tutti i campi necessari
	if (!isTemplateSubset(body, requestTemplate, "_id")) {
		return generateMessageResponse("Invalid input", 400);
	}

	if (body.userList !== undefined) {
		// Otteniamo la lista degli id degli utenti
		const parsedUsers = await getIdFromUsername(body.userList, senderId);

		// Ritorniamo la lista di utenti sbagliati o errore nel db
		if (parsedUsers.status !== 200) {
			return parsedUsers;
		}

		const usersListObj = await parsedUsers.json();
		const usersList: ObjectId[] = usersListObj.users;
		body.userList = usersList;
	}

	// Creo un oggetto senza il campo id
	const { _id, ...newFields } = body;

	// Ottieniamo la collezione dei progetti
	const projectClient: Collection<Project> = await getCollection<Project>(
		PROJECT_COLLECTION
	);

	// Controlliamo che il progetto esista
	const queryOut: WithId<Project>[] | undefined = await findInCollection(
		{ _id: _id },
		projectClient
	);

	if (queryOut === undefined) {
		return generateMessageResponse("Error in database", 400);
	} else if (queryOut.length === 0) {
		return generateMessageResponse("Project not found", 400);
	}

	// Controlliamo che il sender sia l'owner
	if (!queryOut[0].ownerId.equals(senderId)) {
		return generateMessageResponse("Sender isn't the owner", 400);
	}

	// Modifichiamo il progetto
	const modifiedProject: WithId<Project> | undefined | null =
		await updateOneAndFetchInCollection<Project>(
			_id,
			newFields,
			projectClient
		);
	if (modifiedProject === undefined) {
		return generateMessageResponse("Error in database", 400);
	} else if (modifiedProject === null) {
		return generateMessageResponse("Project not found", 400);
	}

	return generateObjectResponse(modifiedProject, 200);
};
