import { ObjectId } from "mongodb";

/*
COLLECTION
*/

export interface Phase {
	_id?: ObjectId; // ID della fase di progetto
	summary: string; // Titolo della fase
	projectId: ObjectId; // Progetto a cui appartiene la fase
	parentId: ObjectId; // Padre della fase, se non coincide con projectId allora è sottofase
}

export function createPhase({
	summary = "",
	projectId = new ObjectId(),
	parentId = new ObjectId(),
}: Partial<Phase>): Phase {
	return {
		summary: summary,
		projectId: projectId,
		parentId: parentId,
	};
}
