import { Message } from "@/utils/db/models/Message";
import { ConvertToString } from "@/utils/db/models/ModelConverter";
import { timeMachine } from "@/utils/timeMachine/timeMachine";
import { ObjectId } from "mongodb";

/*
COLLECTION
*/

export interface GroupChat {
	_id?: ObjectId;				// ID della chat di gruppo
	summary: string;			// Titolo della chat
	ownerId: ObjectId;			// Creatore della chat
	userIdList: ObjectId[];		// Utenti nel gruppo (compreso il creatore come primo utente)
	createdAt: Date;			// Data di creazione della chat
	lastMessageAt: Date;		// Data dell'ultimo di ultima messaggio
	messages: Message[];		// Lista dei messaggi della chat
}

export type StringGroupChat = ConvertToString<GroupChat>;

export function createGroupChat({
	summary = "",
	ownerId = new ObjectId(),
	userIdList = [],
	createdAt = timeMachine.timeMachineTime,
	lastMessageAt = timeMachine.timeMachineTime,
	messages = []
}: Partial<GroupChat>): GroupChat {
	return {
		summary: summary,
		ownerId: ownerId,
		userIdList: userIdList,
		createdAt: createdAt,
		lastMessageAt: lastMessageAt,
		messages: messages
	};
}
