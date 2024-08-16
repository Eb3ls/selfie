import { NextRequest } from "next/server";
import { Collection, WithId, ObjectId } from "mongodb";
import {
	getCollection,
	CHAT_COLLECTION,
	GROUP_CHAT_COLLECTION,
	findInCollection,
} from "@/db_utils/db_functions";

import { User } from "@/db_utils/models/User";
import { Chat } from "@/db_utils/models/Chat";
import { GroupChat } from "@/db_utils/models/GroupChat";
import { Message, createMessage } from "@/db_utils/models/Message";
import {
	parseJSONInput,
	generateMessageResponse,
	isTemplateValid,
	generateObjectResponse,
} from "@/api_utils/api_functions";
import { getSession } from "@/session_utils/session";
import { JWTPayload } from "jose";

const requestTemplate = {
	content: "",
};

export const POST = async (
	request: NextRequest,
	{ params }: { params: { chat_id: string } }
) => {
	// Prendiamo i cookie della richiesta
	const cookies: JWTPayload = (await getSession(
		request.cookies
	)) as JWTPayload; // Assumiamo che la sessione sia stata validata dal middleware

	const sender: Partial<User> = cookies.user as Partial<User>;

	// Prendiamo l'id dell'utente che vuole aggiungere un messaggio alla chat, seguendo l'assunzione
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

	// Otteniamo l'ID della chat dall'URL
	let chatId: ObjectId;
	try {
		chatId = ObjectId.createFromHexString(params.chat_id);
	} catch (e: any) {
		return generateMessageResponse("Invalid chat ID", 400);
	}

	// Controlliamo che la chat esista
	let chat: any;
	let isGroupChat: boolean = false;

	const chatClient: Collection<Chat> = await getCollection<Chat>(
		CHAT_COLLECTION
	);

	const groupChatClient: Collection<GroupChat> =
		await getCollection<GroupChat>(GROUP_CHAT_COLLECTION);

	const queryOut: WithId<Chat>[] | undefined = await findInCollection<Chat>(
		{ _id: chatId },
		chatClient
	);

	if (queryOut === undefined || queryOut.length === 0) {
		// Se la chat non esiste, riproviamo con le chat di gruppo
		const groupQueryOut: WithId<GroupChat>[] | undefined =
			await findInCollection<GroupChat>({ _id: chatId }, groupChatClient);

		if (groupQueryOut === undefined || groupQueryOut.length === 0) {
			return generateMessageResponse("Chat not found", 404);
		}

		chat = groupQueryOut[0];
		isGroupChat = true;
	} else {
		chat = queryOut[0];
		isGroupChat = false;
	}

	// Se arriviamo qui, la chat esiste

	// Controlliamo che l'utente sia uno dei partecipanti alla chat
	let found = false;

	if (isGroupChat) {
		// Se la chat è una chat di gruppo
		const groupChat: WithId<GroupChat> = chat as WithId<GroupChat>;
		for (const user of groupChat.userList) {
			if (user.equals(senderId)) {
				found = true;
				break;
			}
		}
	} else {
		// Se la chat è una chat privata
		const privateChat: WithId<Chat> = chat as WithId<Chat>;
		for (const user of privateChat.users) {
			if (user.equals(senderId)) {
				found = true;
				break;
			}
		}
	}

	// Se l'utente non è uno dei partecipanti alla chat
	if (!found) {
		return generateMessageResponse("You are not part of this chat", 403);
	}

	// Aggiungiamo il messaggio alla chat e aggiorniamo la data dell'ultimo messaggio

	const message: Message = createMessage({
		senderId: senderId,
		content: newBody.content,
	});

	// Aggiungiamo il messaggio alla chat

	const update: any = {
		$push: {
			messages: message,
		},
		$set: {
			lastMessageAt: message.sentAt,
		},
	};

	if (isGroupChat) {
		// Se la chat è una chat di gruppo
		await groupChatClient.updateOne({ _id: chatId }, update);
	} else {
		// Se la chat è una chat privata
		await chatClient.updateOne({ _id: chatId }, update);
	}

	return generateObjectResponse(message, 200);
};
