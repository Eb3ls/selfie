import { ConvertToString } from "@/utils/db/models/ModelConverter";
import { timeMachine } from "@/utils/timeMachine/timeMachine";
import { ObjectId } from "mongodb";

/*
COLLECTION
*/

export interface Message {
	_id?: ObjectId;				// ID del messaggio
	ownerId: ObjectId;			// ID dell'utente che ha inviato il messaggio
	content: string;			// Contenuto del messaggio
	sentAt: Date;				// Data di invio del messaggio
}

export type StringMessage = ConvertToString<Message>;

export function createMessage({
	ownerId = new ObjectId(),
	content = "",
	sentAt = timeMachine.timeMachineTime
}: Partial<Message>): Message {
	return {
		ownerId: ownerId,
		content: content,
		sentAt: sentAt
	};
}
