import { generateMessageResponse, validate } from "@/utils/api/api";
import {
	INVITATION_COLLECTION,
	Invitation,
	deleteCollectionWrapper,
	getCollection
} from "@/utils/db/db";
import { Collection } from "mongodb";
import { NextRequest } from "next/server";

const requestTemplate = {
	_id: ""
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

	// Estraggo l'id dell'utente
	const userId: string = user._id!;

	// Otteniamo la collezione degli inviti
	const invitationClient: Collection<Invitation> =
		await getCollection<Invitation>(INVITATION_COLLECTION);

	// Rimuoviamo l'invito
	return await deleteCollectionWrapper<Invitation>(
		{
			_id: newBody._id,
			userId: userId
		},
		invitationClient
	);
};
