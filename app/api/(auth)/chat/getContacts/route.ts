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
	StringMessage,
	StringUser,
	USER_COLLECTION,
	User,
	findCollectionWrapper,
	getCollection
} from "@/utils/db/db";
import { Collection } from "mongodb";
import { NextRequest } from "next/server";

type UserElement = {
	_id: string;
	username: string;
	userStatus: string;
	profilePic: string;
};

type ChatEntry = {
	_id: string;
	isGroup: boolean;
	summary: string;
	userIdList: string[]; // Lista degli utenti (Il primo è il proprietario)
	createdAt: string;
	lastMessageAt: string | null;
	lastMessage: StringMessage | null;
};

type ChatResponse = {
	chatList: ChatEntry[];
	userList: UserElement[];
	whoAmI: UserElement;
};

function getUserElement(user: StringUser): UserElement {
	return {
		_id: user._id!,
		username: user.username,
		userStatus: user.userStatus,
		profilePic: user.profilePic
	};
}

async function getUserElementFromList(
	users: string[]
): Promise<UserElement[] | null> {
	// Otteniamo la collezione degli utenti
	const userClient: Collection<User> =
		await getCollection<User>(USER_COLLECTION);

	const userElementList: UserElement[] = [];

	// Per ogni utente, otteniamo i dati nel db
	for (const userId of users) {
		const outUser = await findCollectionWrapper<User>(
			{ _id: userId },
			userClient
		);

		if (outUser.status === 500) {
			return null;
		} else if (outUser.status === 200) {
			const user: StringUser = (await outUser.json())[0];
			userElementList.push(getUserElement(user));
		}
	}

	return userElementList;
}

async function getChatEntry(
	chat: StringChat | StringGroupChat,
	senderId: string,
	isGroup: boolean
): Promise<ChatEntry> {
	// Se è una chat di gruppo, il summary è il nome del gruppo
	// Altrimenti, è il nome dell'utente con cui si sta chattando
	let newSummary: string = "";
	if (isGroup) {
		newSummary = (chat as StringGroupChat).summary;
	} else {
		const otherUserId = (chat as StringChat).userIdList.find(
			(userId) => userId !== senderId
		) as string;

		// Otteniamo l'utente con cui si sta chattando
		const otherUser = await getUserElementFromList([otherUserId]);

		if (otherUser === null) {
			newSummary = "Errore";
		} else {
			newSummary = otherUser[0].username;
		}
	}

	// Troviamo l'ultimo messaggio
	let lastMessage: StringMessage | null = null;

	if (chat.messages.length > 0) {
		lastMessage = chat.messages[chat.messages.length - 1];
	}

	return {
		_id: chat._id!,
		isGroup: isGroup,
		summary: newSummary,
		userIdList: chat.userIdList,
		createdAt: chat.createdAt,
		lastMessageAt: chat.lastMessageAt,
		lastMessage: lastMessage
	};
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

	let privateChats: StringChat[] = [];

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

	let groupChats: StringGroupChat[] = [];

	if (outGroupChat.status === 500) {
		// Se c'è stato un errore, ritorna un errore
		return outGroupChat;
	} else if (outGroupChat.status === 404) {
		groupChats = [];
	} else {
		groupChats = await outGroupChat.json();
	}

	// Se arriviamo qui, abbiamo ottenuto 2 array di chat (private e di gruppo)
	// Ora, per ogni chat, dobbiamo ottenere l'ultimo messaggio e l'elenco degli utenti
	// nel formato richiesto

	// Creiamo la lista di tutte le ChatEntry
	const chatList: ChatEntry[] = [];

	for (const chat of privateChats) {
		chatList.push(await getChatEntry(chat, userId, false));
	}

	for (const chat of groupChats) {
		chatList.push(await getChatEntry(chat, userId, true));
	}

	// Creiamo la lista di tutti gli Id degli utenti
	const userIdList: string[] = chatList
		.map((chat) => chat.userIdList)
		.reduce((acc, val) => acc.concat(val), []);

	// Rimuoviamo i duplicati
	const uniqueUserIdList = Array.from(new Set(userIdList));

	const userList = await getUserElementFromList(uniqueUserIdList);

	if (userList === null) {
		return generateMessageResponse("Internal error", 500);
	}

	// Otteniamo l'utente che ha fatto la richiesta
	const whoAmI = userList.find((user) => user._id === userId);

	if (whoAmI === undefined) {
		return generateMessageResponse("Internal error", 500);
	}

	const response: ChatResponse = {
		chatList,
		userList,
		whoAmI
	};

	return generateObjectResponse(response, 200);
};
