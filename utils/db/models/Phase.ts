import { ConvertToString } from "@/utils/db/models/ModelConverter";
import { ObjectId } from "mongodb";

/*
COLLECTION
*/

export interface Phase {
	_id?: ObjectId;			// ID della fase di progetto
	summary: string;		// Titolo della fase
	ownerId: ObjectId;		// Utente che ha creato la fase
	projectId: ObjectId;	// Progetto a cui appartiene la fase
	parentId: ObjectId;		// Padre della fase, se non coincide con projectId allora è sottofase
	dtStart: Date;			// Data di inizio della fase
	due: Date;				// Data di fine della fase
}

export type StringPhase = ConvertToString<Phase>;

export function createPhase({
	summary = "",
	ownerId = new ObjectId(),
	projectId = new ObjectId(),
	parentId = new ObjectId(),
	dtStart = new Date(new Date().toISOString()),
	due = new Date(new Date().toISOString())
}: Partial<Phase>): Phase {
	return {
		summary: summary,
		ownerId: ownerId,
		projectId: projectId,
		parentId: parentId,
		dtStart: dtStart,
		due: due
	};
}
