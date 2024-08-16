import { NextRequest } from "next/server";
import { Collection, WithId, ObjectId } from "mongodb";
import {
	getCollection,
	CHAT_COLLECTION,
	GROUP_CHAT_COLLECTION,
	findInCollection,
	deleteInCollection,
} from "@/db_utils/db_functions";

import { User } from "@/db_utils/models/User";
import { Chat } from "@/db_utils/models/Chat";
import { GroupChat } from "@/db_utils/models/GroupChat";
import {
	parseJSONInput,
	generateMessageResponse,
	isTemplateValid,
} from "@/api_utils/api_functions";
import { getSession } from "@/session_utils/session";
import { JWTPayload } from "jose";

const requestTemplate = {
	_id: new ObjectId(), // ID della chat
};

export const DELETE = async (request: NextRequest) => {
	// Prendiamo i cookie della richiesta
	const cookies: JWTPayload = (await getSession(
		request.cookies
	)) as JWTPayload; // Assumiamo che la sessione sia stata validata dal middleware

	const sender: Partial<User> = cookies.user as Partial<User>;

	// Prendiamo l'id dell'utente che vuole cancellare la chat seguendo l'assunzione
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

	const chatId: ObjectId = newBody._id;

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

	// Controlliamo che l'utente sia il creatore della chat
	if (isGroupChat) {
		if (chat.ownerId.toHexString() !== senderId.toHexString()) {
			return generateMessageResponse("Only the owner is authorized", 401);
		}
	} else {
		if (
			chat.users[0].toHexString() !== senderId.toHexString() &&
			chat.users[1].toHexString() !== senderId.toHexString()
		) {
			return generateMessageResponse(
				"Only participants are authorized",
				401
			);
		}
	}

	// Se arriviamo qui, l'utente è autorizzato a cancellare la chat

	// Eliminiamo la chat
	if (isGroupChat) {
		const result: number | undefined = await deleteInCollection<GroupChat>(
			chatId,
			groupChatClient
		);

		if (result === undefined) {
			return generateMessageResponse("Error in database", 400);
		} else if (result === 1) {
			return generateMessageResponse("Chat not deleted", 400);
		}
	} else {
		const result: number | undefined = await deleteInCollection<Chat>(
			chatId,
			chatClient
		);

		if (result === undefined) {
			return generateMessageResponse("Error in database", 400);
		} else if (result === 1) {
			return generateMessageResponse("Chat not deleted", 400);
		}
	}

	return generateMessageResponse("Chat deleted", 200);
};
