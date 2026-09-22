import {
	addInvitations,
	generateMessageResponse,
	usernameListToIds,
	validate
} from "@/utils/api/api";
import {
	SESSION_COLLECTION,
	Session,
	findCollectionWrapper,
	getCollection
} from "@/utils/db/db";
import { Collection, ObjectId } from "mongodb";
import { NextRequest } from "next/server";

const requestTemplate = {
	username: ""
};

type RequestType = typeof requestTemplate;

export const POST = async (
	request: NextRequest,
	{ params }: { params: Promise<{ session_id: string }> }
) => {
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
	const { session_id } = await params;

	// Estraiamo l'utente e il corpo della richiesta
	const { user: owner, body: newBody } = validation;

	// Otteniamo l'ID della sessione dall'URL
	if (!ObjectId.isValid(session_id)) {
		return generateMessageResponse("Invalid session ID", 400);
	}
	const sessionId: string = session_id;

	// Estraiamo l'id dell'utente
	const userId: string = owner._id!;

	// Estriamo il nome dell'utente da invitare
	const usernameToBeInvited: string = newBody.username;

	// Convertiamo lo username in id
	const convertionOut = await usernameListToIds(
		[usernameToBeInvited],
		userId,
		false
	);

	if (convertionOut.status !== 200) {
		return convertionOut;
	}

	const userIdList: string[] = (await convertionOut.json()).users;

	// Otteniamo l'ID dell'utente da invitare come primo elemento della lista
	const IDToBeInvited = userIdList[0];

	// Controlliamo che l'utente da invitare non sia l'utente stesso
	if (IDToBeInvited === userId) {
		return generateMessageResponse("You cannot invite yourself", 400);
	}

	// Controlliamo che l'utente non stia provando a condividere una sessione che non gli appartiene
	// Otteniamo la collezione delle sessioni
	const sessionClient: Collection<Session> =
		await getCollection<Session>(SESSION_COLLECTION);

	const out = await findCollectionWrapper<Session>(
		{ _id: sessionId, ownerId: userId } as any,
		sessionClient
	);

	if (out.status !== 200) {
		return out;
	}

	// Invitiamo l'utente
	const inviteOut = await addInvitations(
		[IDToBeInvited],
		"SESSION",
		sessionId
	);

	if (inviteOut.status !== 200) {
		return inviteOut;
	}

	return generateMessageResponse("User invited", 200);
};
