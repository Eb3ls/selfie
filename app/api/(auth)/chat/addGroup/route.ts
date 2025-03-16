import {
	generateMessageResponse,
	generateStringModel,
	usernameListToIds,
	validate
} from "@/utils/api/api";
import {
	GROUP_CHAT_COLLECTION,
	GroupChat,
	StringGroupChat,
	addCollectionWrapper,
	getCollection
} from "@/utils/db/db";
import { Collection } from "mongodb";
import { NextRequest } from "next/server";

const requestTemplate = {
	summary: "",
	usernameList: [] // Lista degli utenti della chat escluso il creatore
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

	// Estraggo la lista degli username dal body
	const usernameList: string[] = newBody.usernameList;

	// Convertiamo la lista degli username in lista di id e aggiungiamo il senderId come primo elemento
	const convertionOut = await usernameListToIds(usernameList, senderId);

	if (convertionOut.status !== 200) {
		return convertionOut;
	}

	const userIdList: string[] = (await convertionOut.json()).users;

	// Creiamo la chat di gruppo
	const newGroupChat: StringGroupChat = generateStringModel(
		{
			summary: newBody.summary,
			ownerId: senderId,
			userIdList: userIdList
		},
		"GroupChat"
	);

	// Ottieniamo la collezione delle attività
	const groupChatClient: Collection<GroupChat> =
		await getCollection<GroupChat>(GROUP_CHAT_COLLECTION);

	return await addCollectionWrapper<GroupChat>(newGroupChat, groupChatClient);
};
