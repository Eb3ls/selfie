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

	// Controlliamo che il body abbia tutti i campi necessari
	if (!isTemplateSubset(body, requestTemplate, "_id")) {
		return generateMessageResponse("Invalid input", 400);
	}

	if (body.userList !== undefined) {
		// Iteriamo su userList per convertire ogni username in un ObjectId
		const userList: ObjectId[] = [];

		const userClient: Collection<User> = await getCollection<User>(
			USER_COLLECTION
		);

		for (const username of body.userList) {
			// Controlliamo che l'utente esista
			const queryOut: WithId<User>[] | undefined =
				await findInCollection<User>(
					{ username: username },
					userClient
				);

			// Se l'utente non esiste, restituiamo un messaggio di errore
			if (queryOut === undefined) {
				return generateMessageResponse("Error in database", 404);
			} else if (queryOut.length === 0) {
				return generateMessageResponse("User not found", 404);
			}
			userList.push(queryOut[0]._id);
		}

		// Inseriamo gli id degli user all'interno di body
		body.userList = userList;
		body.userList.unshift(senderId);
	}

	// Creo un oggetto senza il campo id
	const { _id, ...newFields } = body;

	// Ottieniamo la collezione dei progetti
	const projectClient: Collection<Project> = await getCollection<Project>(
		PROJECT_COLLECTION
	);

	// Controlliamo che il progetto esista
	const queryOut: WithId<Project>[] | undefined = await findInCollection(
		_id,
		projectClient
	);

	if (queryOut === undefined) {
		return generateMessageResponse("Error in database", 400);
	} else if (queryOut.length === 0) {
		return generateMessageResponse("Project not found", 400);
	}

	// Controlliamo che il sender sia l'owner
	if (queryOut[0].ownerId !== senderId) {
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
