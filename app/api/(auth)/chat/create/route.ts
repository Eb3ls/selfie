import { NextRequest } from "next/server";
import { Chat, createChat } from "@/db_utils/models/Chat";
import { User } from "@/db_utils/models/User";
import { ObjectId, Collection, WithId } from "mongodb";
import { JWTPayload } from "jose";
import { getSession } from "@/session_utils/session";
import {
	parseJSONInput,
	generateMessageResponse,
	isTemplateValid,
} from "@/api_utils/api_functions";
import {
	getCollection,
	USER_COLLECTION,
	findInCollection,
	CHAT_COLLECTION,
} from "@/db_utils/db_functions";
import { Underdog } from "next/font/google";

const requestTemplate = {
	receiver: "", // username dell'utente con cui si vuole creare una chat
};

export const PUT = async (request: NextRequest) => {
	// Prendiamo i cookie della richiesta
	const cookies: JWTPayload = (await getSession(
		request.cookies
	)) as JWTPayload; // Assumiamo che la sessione sia stata validata dal middleware

	const sender: Partial<User> = cookies.user as Partial<User>;

	// Convertiamo in JSON il body della richiesta
	const body: Object | undefined = await parseJSONInput(request);
	if (body === undefined) {
		return generateMessageResponse("Invalid input", 400);
	}

	const senderId: any = sender._id;

	// Controlliamo che il body abbia tutti i campi necessari
	if (!isTemplateValid(body, requestTemplate)) {
		return generateMessageResponse("Invalid input", 400);
	}

	const newBody: any = { ...body };

	// Prendo lo username dell'utente con cui l'utente attivo vuole creare una chat
	const receiver: string = newBody.receiver;

	// Controlliamo che l'utente esista
	const client: Collection<User> = await getCollection<User>(USER_COLLECTION);

	const queryOut: WithId<User>[] | undefined = await findInCollection<User>(
		{ username: receiver },
		client
	);

	// Se l'utente non esiste, restituiamo un messaggio di errore
	if (queryOut === undefined) {
		return generateMessageResponse("Error in database", 400);
	} else if (queryOut.length === 0) {
		return generateMessageResponse("User not found", 400);
	}

	// Se la chat esiste già, non la creare

	const chatCollection: Collection<Chat> = await getCollection<Chat>(
		CHAT_COLLECTION
	);

	const queryIn: WithId<Chat>[] | undefined = await findInCollection<Chat>(
		{ users: [senderId, queryOut[0]._id] },
		chatCollection
	);

	if (queryIn === undefined) {
		return generateMessageResponse("Error in chat db", 400);
	} else if (queryIn.length > 0) {
		return generateMessageResponse("Chat already exists", 400);
	}

	// Creo la chat

	const newChat: any = createChat({
		users: [ObjectId.createFromHexString(senderId), queryOut[0]._id],
	});

	// Inserisco la chat nel database
	const result = await chatCollection.insertOne(newChat);

	if (result === undefined) {
		return generateMessageResponse("Chat not created", 400);
	}

	return generateMessageResponse("Chat created", 200);
};
