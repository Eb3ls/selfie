import { generateMessageResponse, validate } from "@/utils/api/api";
import {
	USER_COLLECTION,
	User,
	findCollectionWrapper,
	getCollection,
	updateCollectionWrapper
} from "@/utils/db/db";
import { Collection } from "mongodb";
import { NextRequest } from "next/server";

const requestTemplate = {
	subscription: {
		endpoint: "",
		expirationTime: 0,
		keys: {
			p256dh: "",
			auth: ""
		}
	}
};

type RequestType = typeof requestTemplate;

export const POST = async (request: NextRequest) => {
	// Validazione della richiesta
	const validation = await validate<RequestType>(
		request,
		requestTemplate,
		false
	);

	// Se la validazione fallisce, ritorna il messaggio di errore
	if (validation === null) {
		return generateMessageResponse("Invalid request", 400);
	}

	// Estraiamo l'utente e il corpo della richiesta
	const { user: user, body: newBody } = validation;

	// Estraiamo l'id dell'utente
	const userId: string = user._id!;

	// Ottieniamo la collezione degli utenti
	const client: Collection<User> = await getCollection<User>(USER_COLLECTION);

	const userOut = await findCollectionWrapper<User>({ _id: userId }, client);

	if (userOut.status !== 200) {
		return generateMessageResponse("User not found", 400);
	}

	// Creiamo un oggetto con i campi da modificare
	const newFields = {
		subscriptionList: newBody.subscription
	};

	// Modifichiamo l'utente
	const updateOut = await updateCollectionWrapper<User>(
		{ _id: userId },
		{ $push: newFields } as any,
		client
	);

	if (updateOut.status !== 200) {
		return updateOut;
	}

	return generateMessageResponse("Subscription set", 200);
};
