import { NextRequest } from "next/server";
import { Collection, WithId, ObjectId } from "mongodb";
import {
	getCollection,
	USER_COLLECTION,
	GROUP_CHAT_COLLECTION,
	addToCollection,
	findInCollection,
} from "@/db_utils/db_functions";

import { User } from "@/db_utils/models/User";
import { GroupChat, createGroupChat } from "@/db_utils/models/GroupChat";
import {
	parseJSONInput,
	generateMessageResponse,
	isTemplateValid,
	generateObjectResponse,
} from "@/api_utils/api_functions";
import { getSession } from "@/session_utils/session";
import { JWTPayload } from "jose";

const requestTemplate = {
	summary: "",
	userIdList: [], // Lista degli utenti della chat escluso il creatore
};

export const POST = async (request: NextRequest) => {
	// Prendiamo i cookie della richiesta
	const cookies: JWTPayload = (await getSession(
		request.cookies
	)) as JWTPayload; // Assumiamo che la sessione sia stata validata dal middleware

	const sender: Partial<User> = cookies.user as Partial<User>;

	// Prendiamo l'id dell'utente che vuole creare la chat di gruppo seguendo l'assunzione
	const senderId: ObjectId = ObjectId.createFromHexString(sender._id! as any);

	// Convertiamo in JSON il body della richiesta
	const body: Object | undefined = await parseJSONInput(request);
	if (body === undefined) {
		return generateMessageResponse("Invalid input", 400);
	}

	// Controlliamo che il body abbia tutti i campi necessari
	if (!isTemplateValid(body, requestTemplate)) {
		return generateMessageResponse("Invalid input", 400);
	}

	const newBody: any = { ...body };

	// Iteriamo su userList per convertire ogni username in un ObjectId
	const userList: ObjectId[] = [];

	const client: Collection<User> = await getCollection<User>(USER_COLLECTION);

	for (const username of newBody.userIdList) {
		// Controlliamo che l'utente esista
		const queryOut: WithId<User>[] | undefined =
			await findInCollection<User>({ username: username }, client);

		// Se l'utente non esiste, restituiamo un messaggio di errore
		if (queryOut === undefined) {
			return generateMessageResponse("Error in database", 404);
		} else if (queryOut.length === 0) {
			return generateMessageResponse("User not found", 404);
		}
		userList.push(queryOut[0]._id);
	}

	// Creiamo la chat di gruppo
	const newGroupChat: GroupChat = createGroupChat({
		summary: newBody.summary,
		ownerId: senderId,
		userIdList: [senderId, ...userList],
	});

	// Inseriamo la chat di gruppo nel database
	const groupChatClient: Collection<GroupChat> =
		await getCollection<GroupChat>(GROUP_CHAT_COLLECTION);

	// Inseriamo la chat di gruppo nel database
	const result = await addToCollection<GroupChat>(
		newGroupChat,
		groupChatClient
	);

	if (result === undefined) {
		return generateMessageResponse("Error in database", 400);
	} else if (result === false) {
		return generateMessageResponse("Chat not created", 400);
	}

	return generateObjectResponse(newGroupChat, 200);
};
