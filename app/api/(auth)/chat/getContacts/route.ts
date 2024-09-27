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
	findCollectionWrapper,
	getCollection
} from "@/utils/db/db";
import { Collection } from "mongodb";
import { NextRequest } from "next/server";

interface ChatResponse {
	privateChats: Chat[];
	groupChats: GroupChat[];
}

export const GET = async (request: NextRequest) => {
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

	// Otteniamo le collezioni delle chat
	const chatClient: Collection<Chat> =
		await getCollection<Chat>(CHAT_COLLECTION);

	const groupChatClient: Collection<GroupChat> =
		await getCollection<GroupChat>(GROUP_CHAT_COLLECTION);

	// Otteniamo tutte le chat a cui l'utente partecipa
	const outChat = await findCollectionWrapper<Chat>(
		{ userIdList: { $in: [userId] } } as any,
		chatClient
	);

	let privateChats: any;

	if (outChat.status === 500) {
		// Se c'è stato un errore, ritorna un errore
		return outChat;
	} else if (outChat.status === 404) {
		privateChats = [];
	} else {
		privateChats = await outChat.json();
	}

	const outGroupChat = await findCollectionWrapper<GroupChat>(
		{ userIdList: { $in: [userId] } } as any,
		groupChatClient
	);

	let groupChats: any;

	if (outGroupChat.status === 500) {
		// Se c'è stato un errore, ritorna un errore
		return outGroupChat;
	} else if (outGroupChat.status === 404) {
		groupChats = [];
	} else {
		groupChats = await outGroupChat.json();
	}

	// Se arriviamo qui, abbiamo ottenuto 2 array di chat (private e di gruppo)

	const response: ChatResponse = {
		privateChats,
		groupChats
	};

	return generateObjectResponse(response, 200);
};
