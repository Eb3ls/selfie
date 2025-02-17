import {
	generateMessageResponse,
	generateObjectResponse,
	validate
} from "@/utils/api/api";
import {
	INVITATION_COLLECTION,
	Invitation,
	StringInvitation,
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

	// Otteniamo la collezione degli inviti
	const invitationClient: Collection<Invitation> =
		await getCollection<Invitation>(INVITATION_COLLECTION);

	// Otteniamo tutti gli inviti che hanno come destinatario l'utente
	const outInvitation = await findCollectionWrapper<Invitation>(
		{
			userId: userId
		},
		invitationClient
	);

	if (outInvitation.status === 404) {
		// Se non ci sono inviti, ritorna un array vuoto
		return generateObjectResponse([], 200);
	}

	if (outInvitation.status !== 200) {
		// Se c'è stato un errore, ritorna un errore
		return outInvitation;
	}

	const invitationArray: StringInvitation[] = await outInvitation.json();

	return generateObjectResponse(invitationArray, 200);
};
