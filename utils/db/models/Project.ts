import { ConvertToString } from "@/utils/db/models/ModelConverter";
import { ObjectId } from "mongodb";

/*
COLLECTION
*/

export interface Project {
	_id?: ObjectId;				// ID del progetto
	summary: string;			// Titolo del progetto
	ownerId: ObjectId;			// ID del proprietario, coincide col primo elemento dell'array
	userIdList: ObjectId[];		// Lista di ID degli utenti del progetto
	noteId: ObjectId;			// 1:1 nota associata al progetto
}

export type StringProject = ConvertToString<Project>;

export function createProject({
	summary = "",
	ownerId = new ObjectId(),	// Abuso di default value
	userIdList = [],
	noteId = new ObjectId()		// Abuso di default value
}: Partial<Project>): Project {
	return {
		summary: summary,
		ownerId: ownerId,
		userIdList: userIdList,
		noteId: noteId
	};
}
