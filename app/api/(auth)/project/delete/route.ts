import { NextRequest } from "next/server";
import { Collection, WithId, ObjectId } from "mongodb";
import {
	getCollection,
	PROJECT_COLLECTION,
	findInCollection,
	deleteInCollection,
} from "@/db_utils/db_functions";

import { User } from "@/db_utils/models/User";
import { Project } from "@/db_utils/models/Project";
import {
	parseJSONInput,
	isTemplateValid,
	generateMessageResponse,
} from "@/api_utils/api_functions";
import { getSession } from "@/session_utils/session";
import { JWTPayload } from "jose";

const requestTemplate: Partial<Project> = {
	_id: new ObjectId(),
};

export const DELETE = async (request: NextRequest) => {
	// Prendiamo i cookie della richiesta
	const cookies: JWTPayload = (await getSession(
		request.cookies
	)) as JWTPayload; // Assumiamo che la sessione sia stata validata dal middleware

	const sender: Partial<User> = cookies.user as Partial<User>;
	// Prendiamo l'id dell'utente che vuole eliminare il progetto seguendo l'assunzione
	const senderId: ObjectId = ObjectId.createFromHexString(sender._id! as any);

	// Convertiamo in JSON il body della richiesta
	const body: any | undefined = await parseJSONInput(request);
	if (body === undefined) {
		return generateMessageResponse("Invalid input", 400);
	}

	// Controlliamo che il body abbia tutti i campi necessari
	if (!isTemplateValid(body, requestTemplate)) {
		return generateMessageResponse("Invalid input", 400);
	}

	// Estraggo l'id dal body
	const id: ObjectId = body._id;

	// Otteniamo la collezione dei progetti
	const client: Collection<Project> = await getCollection<Project>(
		PROJECT_COLLECTION
	);

	// Controlliamo che il progetto esista
	const queryOut: WithId<Project>[] | undefined = await findInCollection(
		id,
		client
	);

	if (queryOut === undefined) {
		return generateMessageResponse("Error in database", 400);
	} else if (queryOut.length === 0) {
		return generateMessageResponse("Project not found", 400);
	}

	// Controlliamo che il sender sia l'owner
	if (queryOut[0].ownerId !== senderId) {
		return generateMessageResponse("Sender isn't the owner", 400);
	}

	// Eliminiamo il progetto
	const result: number | undefined = await deleteInCollection(id, client);
	if (result === undefined) {
		generateMessageResponse("Error while deleting", 400);
	}
	generateMessageResponse("Project deleted", 200);
};
