import { ConvertToString } from "@/utils/db/models/ModelConverter";
import { ObjectId } from "mongodb";

/*
COLLECTION
*/

export interface Invitation {
	_id?: ObjectId;											// ID dell'invito
	userId: ObjectId;										// ID dell'utente che ha ricevuto l'invito
	type: "ACTIVITY" | "EVENT" | "SESSION" | "PROJECT";		// Tipo di invito
	targetId: ObjectId;										// ID della risorsa a cui è rivolto l'invito
}

export type StringInvitation = ConvertToString<Invitation>;

export function createInvitation({
	userId = new ObjectId(),	// Abuso di default value
	type = "ACTIVITY",
	targetId = new ObjectId()		// Abuso di default value
}: Partial<Invitation>): Invitation {
	return {
		userId: userId,
		type: type,
		targetId: targetId
	};
}
