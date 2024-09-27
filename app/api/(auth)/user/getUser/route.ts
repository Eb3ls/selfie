import { generateMessageResponse, validate } from "@/utils/api/api";
import {
	USER_COLLECTION,
	User,
	findCollectionWrapper,
	getCollection
} from "@/utils/db/db";
import { Collection } from "mongodb";
import { NextRequest } from "next/server";

export const GET = async (request: NextRequest) => {
	// Validazione della richiesta
	const validation = await validate<{}>(request, {}, false);

	// Se la validazione fallisce, ritorna il messaggio di errore
	if (validation === null) {
		return generateMessageResponse("Invalid request", 400);
	}

	// Estraiamo l'utente e il corpo della richiesta
	const { user: user, body: newBody } = validation;

	// Estraggo l'id dell'utente
	const userId: string = user._id!;

	// Otteniamo la collezione degli utenti
	const userClient: Collection<User> =
		await getCollection<User>(USER_COLLECTION);

	// Otteniamo l'utente richiesto
	return findCollectionWrapper<User>({ _id: userId } as any, userClient);
};
