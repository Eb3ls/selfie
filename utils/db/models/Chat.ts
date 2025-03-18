import { Message } from "@/utils/db/models/Message";
import { ConvertToString } from "@/utils/db/models/ModelConverter";
import { timeMachine } from "@/utils/timeMachine/timeMachine";
import { ObjectId } from "mongodb";

/*
COLLECTION
*/

export interface Chat {
	_id?: ObjectId;						// ID della chat
	userIdList: [ObjectId, ObjectId];	// Utenti della chat privata
	createdAt: Date;					// Data di creazione
	lastMessageAt: Date | null;			// Data ultimo messaggio
	messages: Message[];				// Lista dei messaggi della chat
}

export type StringChat = ConvertToString<Chat>;

export function createChat({
	userIdList = [new ObjectId(), new ObjectId()],
	createdAt = timeMachine.timeMachineTime,
	lastMessageAt = null,
	messages = []
}: Partial<Chat>): Chat {
	return {
		userIdList: userIdList,
		createdAt: createdAt,
		lastMessageAt: lastMessageAt,
		messages: messages
	};
}
