import { NextRequest } from "next/server";
import { Collection, ObjectId } from "mongodb";
import { getCollection, PROJECT_COLLECTION } from "@/db_utils/db_functions";
import {
	findCollectionWrapper,
	updateOneCollectionWrapper,
} from "@/db_utils/db_wrappers";
import { Project } from "@/db_utils/models/Project";
import {
	generateMessageResponse,
	getIdFromUsername,
	standardValidation,
} from "@/api_utils/api_functions";

const requestTemplate: Partial<Project> = {
	_id: new ObjectId(),
	summary: "",
	userIdList: [],
};

export const PATCH = async (request: NextRequest) => {
	// Validazione standard
	const validation = await standardValidation<Project>(
		request,
		requestTemplate,
		true,
		true
	);

	// Se la validazione fallisce, ritorna il messaggio di errore
	if (validation === null) {
		return generateMessageResponse("Invalid request", 400);
	}

	// Estraiamo l'utente e il corpo della richiesta
	const { user: user, body: body } = validation;
	// Prendiamo il senderId
	const senderId: ObjectId = user._id!;

	if (body.userIdList !== undefined) {
		// Otteniamo la lista degli id degli utenti
		const parsedUsers = await getIdFromUsername(
			body.userIdList as unknown as string[], // Al posto di unknown si può mappare per convertire in stringa ma è inutile
			senderId
		);

		// Ritorniamo la lista di utenti sbagliati o errore nel db
		if (parsedUsers.status !== 200) {
			return parsedUsers;
		}

		const usersData = await parsedUsers.json();
		body.userIdList = usersData.users.map(
			(user: string) => new ObjectId(user)
		);
	}

	// Creo un oggetto senza il campo id
	const { _id, ...newFields } = body;

	// Ottieniamo la collezione dei progetti
	const projectClient: Collection<Project> = await getCollection<Project>(
		PROJECT_COLLECTION
	);

	// Controlliamo che il progetto esista
	const projectQueryOut = await findCollectionWrapper<Project>(
		{ _id: _id, ownerId: senderId },
		projectClient
	);

	// Se non esiste il progetto
	if (projectQueryOut.status !== 200) {
		return projectQueryOut;
	}

	// Aggiorniamo il progetto
	return updateOneCollectionWrapper<Project>(
		_id!,
		newFields as Project,
		projectClient
	);
};
