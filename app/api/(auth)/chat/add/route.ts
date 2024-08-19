import { NextRequest } from "next/server";
import { Collection, WithId, ObjectId } from "mongodb";
import {
	getCollection,
	USER_COLLECTION,
	CHAT_COLLECTION,
	addToCollection,
	findInCollection,
} from "@/db_utils/db_functions";

import { User } from "@/db_utils/models/User";
import { Chat, createChat } from "@/db_utils/models/Chat";
import {
	parseJSONInput,
	generateMessageResponse,
	isTemplateValid,
	generateObjectResponse,
} from "@/api_utils/api_functions";
import { getSession } from "@/session_utils/session";
import { JWTPayload } from "jose";

const requestTemplate = {
	receiver: "",
};

export const POST = async (request: NextRequest) => {
	// Prendiamo i cookie della richiesta
	const cookies: JWTPayload = (await getSession(
		request.cookies
	)) as JWTPayload; // Assumiamo che la sessione sia stata validata dal middleware

	const sender: Partial<User> = cookies.user as Partial<User>;

	// Prendiamo l'id dell'utente che vuole creare la chat seguendo l'assunzione
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

	const receiverUsername: string = newBody.receiver;

	// Controlliamo che l'utente esista
	const client: Collection<User> = await getCollection<User>(USER_COLLECTION);

	const queryOut: WithId<User>[] | undefined = await findInCollection<User>(
		{ username: receiverUsername },
		client
	);

	// Se l'utente non esiste, restituiamo un messaggio di errore
	if (queryOut === undefined) {
		return generateMessageResponse("Error in database", 400);
	} else if (queryOut.length === 0) {
		return generateMessageResponse("User not found", 400);
	}

	// Controlliamo che la chat non esista già
	const receiverId: ObjectId = queryOut[0]._id;

	const chatClient: Collection<Chat> = await getCollection<Chat>(
		CHAT_COLLECTION
	);

	const chatQueryOut: WithId<Chat>[] | undefined =
		await findInCollection<Chat>(
			{
				users: { $all: [senderId, receiverId] },
			},
			chatClient
		);

	if (chatQueryOut === undefined) {
		return generateMessageResponse("Error in database", 400);
	} else if (chatQueryOut.length > 0) {
		return generateMessageResponse("Chat already exists", 400);
	}

	// Creiamo la chat
	const newChat: Chat = createChat({
		userIdList: [senderId, receiverId],
	});

	// Inseriamo la chat nel database
	const result = await addToCollection<Chat>(newChat, chatClient);

	if (result === undefined) {
		return generateMessageResponse("Error in database", 400);
	} else if (result === false) {
		return generateMessageResponse("Chat not created", 400);
	}

	return generateObjectResponse(newChat, 200);
};
