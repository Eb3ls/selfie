import {
	generateMessageResponse,
	generateObjectResponse,
	validate
} from "@/utils/api/api";
import {
	CHAT_COLLECTION,
	Chat,
	GROUP_CHAT_COLLECTION,
	GroupChat,
	StringChat,
	StringGroupChat,
	findCollectionWrapper,
	getCollection
} from "@/utils/db/db";
import { Collection, ObjectId } from "mongodb";
import { NextRequest } from "next/server";

export const GET = async (
	request: NextRequest,
	{ params }: { params: { chat_id: string } }
) => {
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

	// Otteniamo l'ID della chat dall'URL
	if (!ObjectId.isValid(params.chat_id)) {
		return generateMessageResponse("Invalid chat ID", 400);
	}
	const chatId: string = params.chat_id;

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

	return generateObjectResponse(chat, 200);
};
