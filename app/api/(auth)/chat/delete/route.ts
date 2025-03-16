import { generateMessageResponse, validate } from "@/utils/api/api";
import {
	CHAT_COLLECTION,
	Chat,
	GROUP_CHAT_COLLECTION,
	GroupChat,
	StringChat,
	StringGroupChat,
	deleteCollectionWrapper,
	findCollectionWrapper,
	getCollection
} from "@/utils/db/db";
import { Collection } from "mongodb";
import { NextRequest } from "next/server";

const requestTemplate = {
	_id: "" // ID della chat
};

type RequestType = typeof requestTemplate;

export const DELETE = async (request: NextRequest) => {
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

	// Estraiamo l'utente e il corpo della richiesta
	const { user: user, body: newBody } = validation;

	// Estraggo l'id dell'utente
	const senderId: string = user._id!;

	const chatId: string = newBody._id!;

	// Otteniamo le collezioni delle chat
	const chatClient: Collection<Chat> =
		await getCollection<Chat>(CHAT_COLLECTION);

	const groupChatClient: Collection<GroupChat> =
		await getCollection<GroupChat>(GROUP_CHAT_COLLECTION);

	// Controlliamo che la chat esista
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

	// Controlliamo che l'utente sia il creatore della chat
	if (isGroupChat) {
		// Se la chat è una chat di gruppo
		const getChat: StringGroupChat = chat;
		if (getChat.ownerId !== senderId) {
			return generateMessageResponse("Only the owner is authorized", 403);
		}
	} else {
		// Se la chat è una chat privata
		const getChat: StringChat = chat;
		if (
			getChat.userIdList[0] !== senderId &&
			getChat.userIdList[1] !== senderId
		) {
			return generateMessageResponse(
				"Only participants are authorized",
				403
			);
		}
	}

	// Se arriviamo qui, l'utente è autorizzato a cancellare la chat

	// Eliminiamo la chat
	if (isGroupChat) {
		return await deleteCollectionWrapper<GroupChat>(
			{ _id: chatId },
			groupChatClient
		);
	} else {
		return await deleteCollectionWrapper<Chat>({ _id: chatId }, chatClient);
	}
};
