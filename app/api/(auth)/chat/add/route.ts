import {
	generateMessageResponse,
	generateStringModel,
	usernameListToIds,
	validate
} from "@/utils/api/api";
import {
	CHAT_COLLECTION,
	Chat,
	StringChat,
	addCollectionWrapper,
	findCollectionWrapper,
	getCollection
} from "@/utils/db/db";
import { Collection } from "mongodb";
import { NextRequest } from "next/server";

const requestTemplate = {
	receiver: ""
};

type RequestType = typeof requestTemplate;

export const POST = async (request: NextRequest) => {
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

	// Estraggo lo username dal body
	const receiverUsername: string = newBody.receiver;

	// Convertiamo lo username in id e aggiungiamo il senderId come primo elemento
	const convertionOut = await usernameListToIds([receiverUsername], senderId);

	if (convertionOut.status !== 200) {
		return convertionOut;
	}

	const userIdList: string[] = (await convertionOut.json()).users;

	if (userIdList.length !== 2) {
		return generateMessageResponse("Invalid request", 400);
	}

	// Controlliamo che la chat non esista già
	const chatClient: Collection<Chat> =
		await getCollection<Chat>(CHAT_COLLECTION);

	const filter: any = {
		userIdList: { $all: userIdList }
	};

	const chatOut = await findCollectionWrapper<Chat>(filter, chatClient);

	if (chatOut.status === 500) {
		return chatOut;
	} else if (chatOut.status === 200) {
		return generateMessageResponse("Chat already exists", 400);
	}

	// Creiamo la chat
	const newChat: StringChat = generateStringModel<StringChat>(
		{
			userIdList: userIdList
		},
		"Chat"
	);

	return await addCollectionWrapper<Chat>(newChat, chatClient);
};
