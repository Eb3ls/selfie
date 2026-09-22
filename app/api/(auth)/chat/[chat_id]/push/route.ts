import {
	generateMessageResponse,
	generateObjectResponse,
	generateStringModel,
	validate
} from "@/utils/api/api";
import {
	CHAT_COLLECTION,
	Chat,
	GROUP_CHAT_COLLECTION,
	GroupChat,
	StringChat,
	StringGroupChat,
	StringMessage,
	findCollectionWrapper,
	getCollection,
	updateCollectionWrapper
} from "@/utils/db/db";
import { Collection, ObjectId } from "mongodb";
import { NextRequest } from "next/server";

const requestTemplate = {
	content: ""
};

type RequestType = typeof requestTemplate;

export const POST = async (
	request: NextRequest,
	{ params }: { params: Promise<{ chat_id: string }> }
) => {
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
	const { chat_id } = await params;

	// Estraiamo l'utente e il corpo della richiesta
	const { user: user, body: newBody } = validation;

	// Estraggo l'id dell'utente
	const userId: string = user._id!;

	// Otteniamo l'ID della chat dall'URL
	if (!ObjectId.isValid(chat_id)) {
		return generateMessageResponse("Invalid chat ID", 400);
	}
	const chatId: string = chat_id;

	// Otteniamo le collezioni delle chat
	const chatClient: Collection<Chat> =
		await getCollection<Chat>(CHAT_COLLECTION);

	const groupChatClient: Collection<GroupChat> =
		await getCollection<GroupChat>(GROUP_CHAT_COLLECTION);

	// Otteniamo la chat richiesta
	let chat: any;
	let isGroupChat: boolean = false;

	const outChat = await findCollectionWrapper<Chat>(
		{ _id: chatId },
		chatClient
	);

	if (outChat.status !== 200) {
		// Se la chat non è stata trovata, proviamo a cercarla tra le chat di gruppo
		const outGroup = await findCollectionWrapper<GroupChat>(
			{ _id: chatId },
			groupChatClient
		);

		if (outGroup.status !== 200) {
			// Se la chat non è stata trovata, ritorna un errore
			return generateMessageResponse("Chat not found", 404);
		}

		chat = (await outGroup.json())[0];
		isGroupChat = true;
	} else {
		chat = (await outChat.json())[0];
	}

	// Se arriviamo qui, la chat esiste

	// Controlliamo che l'utente sia uno dei partecipanti alla chat
	let found: boolean = false;

	if (isGroupChat) {
		// Se la chat è una chat di gruppo
		const getChat: StringGroupChat = chat;
		for (const user of getChat.userIdList) {
			if (user === userId) {
				found = true;
				break;
			}
		}
	} else {
		// Se la chat è una chat privata
		const getChat: StringChat = chat;
		for (const user of getChat.userIdList) {
			if (user === userId) {
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

	const message: StringMessage = generateStringModel<StringMessage>(
		{
			ownerId: userId,
			content: newBody.content
		},
		"Message"
	);

	// Aggiungiamo il messaggio alla chat

	const update: any = {
		$push: {
			messages: message
		},
		$set: {
			lastMessageAt: message.sentAt
		}
	};

	let out: any;

	if (isGroupChat) {
		// Se la chat è una chat di gruppo
		out = await updateCollectionWrapper<GroupChat>(
			{ _id: chatId },
			update,
			groupChatClient
		);
	} else {
		// Se la chat è una chat privata
		out = await updateCollectionWrapper<Chat>(
			{ _id: chatId },
			update,
			chatClient
		);
	}

	if (out.status !== 200) {
		return out;
	}

	const updatedChat: StringChat | StringGroupChat = (await out.json())[0];

	return generateObjectResponse(updatedChat, 200);
};
