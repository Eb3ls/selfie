import { NextRequest } from "next/server";
import {
	generateMessageResponse,
	parseJSONInput,
	isTemplateValid,
} from "@/api_utils/api_functions";
import { JWTPayload } from "jose";
import { getSession } from "@/session_utils/session";
import { User } from "@/db_utils/models/User";
import { createMessage, Message } from "@/db_utils/models/Message";
import { Chat } from "@/db_utils/models/Chat";
import { Collection, WithId } from "mongodb";
import {
	getCollection,
	USER_COLLECTION,
	findInCollection,
	CHAT_COLLECTION,
	MESSAGE_COLLECTION,
} from "@/db_utils/db_functions";

const requestTemplate: Partial<Message> = {
	content: "",
};

export const POST = async (
	request: NextRequest,
	{ params }: { params: { username: string } }
) => {
	// Prendiamo i cookie della richiesta
	const cookies: JWTPayload = (await getSession(
		request.cookies
	)) as JWTPayload; // Assumiamo che la sessione sia stata validata dal middleware

	// Convertiamo in JSON il body della richiesta
	const body: Object | undefined = await parseJSONInput(request);
	if (body === undefined) {
		return generateMessageResponse("Invalid input", 400);
	}

	const newBody: any = { ...body };

	// Controllo che il body abbia tutti i campi necessari
	if (!isTemplateValid(newBody, requestTemplate)) {
		return generateMessageResponse("Invalid input", 400);
	}

	// Estraggo il content in una stringa
	const content: string = newBody.content;
	if (content === "") {
		return generateMessageResponse("Invalid input", 400);
	}

	const sender: Partial<User> = cookies.user as Partial<User>;

	// Prendo il parametro username dal parametro dinamico
	const receiver: string = params.username;

	// Controllo che il receiver esista
	const client: Collection<User> = await getCollection<User>(USER_COLLECTION);
	const queryOut: WithId<User>[] | undefined = await findInCollection<User>(
		{ username: receiver },
		client
	);
	if (queryOut === undefined) {
		return generateMessageResponse("Error in db connection", 404);
	} else if (queryOut.length === 0) {
		return generateMessageResponse("User not found", 404);
	}

	// Prendo l'id dell'utente trovato e lo confronto con l'id dell'utente attivo
	const senderId: any = sender._id;
	if (senderId == queryOut[0]._id) {
		return generateMessageResponse("Same user", 401);
	}

	// Prendo la chat associata al receiver
	const chat: Collection<Chat> = await getCollection<Chat>(CHAT_COLLECTION);
	const chatQueryOut: WithId<Chat>[] | undefined =
		await findInCollection<Chat>(
			{ users: [senderId, queryOut[0]._id] },
			chat
		);
	if (chatQueryOut === undefined) {
		return generateMessageResponse("Error in db connection", 404);
	} else if (chatQueryOut.length === 0) {
		return generateMessageResponse("Chat not found", 404);
	}

	// Creo il messaggio
	const newMessage = createMessage({
		senderId: senderId,
		receivers: [queryOut[0]._id],
		chatId: chatQueryOut[0]._id,
		content: content,
	});

	// Inserisco il messaggio nel db
	// Errore stranissimo - commento
	/*const messageClient: Collection<Message> = await getCollection<Message>(
		MESSAGE_COLLECTION
	);*/
};
