import { ObjectId } from "mongodb";

/*
COLLECTION
*/

export interface Phase {
	_id?: ObjectId;
	summary: string;
	phaseList: Phase[];
	projectId: ObjectId;
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
