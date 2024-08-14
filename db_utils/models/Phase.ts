import { ObjectId } from "mongodb";

/*
COLLECTION
*/

export interface Phase {
	_id?: ObjectId;				// ID della fase di progetto
	summary: string;			// Titolo della fase
	phaseList: Phase[];			// Lista delle sotto-fasi
	projectId: ObjectId;		// Progetto a cui appartiene la fase
}

export function createPhase({
	summary = "",
	phaseList = [],
	projectId = new ObjectId(),
}: Partial<Phase>): Phase {
	return {
		summary: summary,
		phaseList: phaseList,
		projectId: projectId,
	};
}
