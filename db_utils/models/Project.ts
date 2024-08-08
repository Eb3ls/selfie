import { ObjectId } from "mongodb";

/*
COLLECTION
*/

export interface Project {
	_id?: ObjectId; 		// ID del progetto
	summary: string; 		// Titolo del progetto
	ownerId: ObjectId; 		// ID del proprietario, coincide col primo elemento dell'array
	userList: ObjectId[]; 	// Lista di ID degli utenti del progetto
	note: ObjectId; 		//1:1 nota associata al progetto
}

export function createProject({
	summary = "",
	ownerId = new ObjectId(), // Abuso di default value
	userList = [],
	note = new ObjectId(), // Abuso di default value
}: Partial<Project>): Project {
	return {
		summary: summary,
		ownerId: ownerId,
		userList: userList,
		note: note,
	};
}
