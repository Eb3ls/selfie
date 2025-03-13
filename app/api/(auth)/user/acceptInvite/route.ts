import { generateMessageResponse, validate } from "@/utils/api/api";
import {
	ACTIVITY_COLLECTION,
	Activity,
	EVENT_COLLECTION,
	Event,
	INVITATION_COLLECTION,
	Invitation,
	StringActivity,
	StringEvent,
	StringInvitation,
	deleteCollectionWrapper,
	findCollectionWrapper,
	getCollection,
	updateCollectionWrapper
} from "@/utils/db/db";
import { Collection } from "mongodb";
import { NextRequest } from "next/server";

const requestTemplate = {
	_id: "",
	type: ""
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

	// Otteniamo tutti gli invititi che hanno come destinatario l'utente
	const outInvitation = await findCollectionWrapper<Invitation>(
		{
			_id: newBody._id,
			userId: userId
		},
		invitationClient
	);

	if (outInvitation.status !== 200) {
		return outInvitation;
	}

	const invitation: StringInvitation = (await outInvitation.json())[0];

	// Se arriviamo a questo punto l'invito esiste e possiamo procedere con l'accettazione.
	// Per accettarlo dobbiamo aggiungere l'utente alla lista degli utenti che hanno accesso al targetId dell'invito.
	// Prima di tutto capiamo di che tipo è l'invito.
	// Ci sono 3 tipi di inviti: "ACTIVITY" | "EVENT" | "SESSION" | "PROJECT".

	const type: string = invitation.type;
	const targetId: string = invitation.targetId;
	const invitationId: string = invitation._id!;

	// Controlliamo se l'invito è tra le tipologie supportate.
	if (
		type !== "ACTIVITY" &&
		type !== "EVENT" &&
		type !== "SESSION" &&
		type !== "PROJECT"
	) {
		return generateMessageResponse("Invalid type", 400);
	}

	if (type === "ACTIVITY") {
		// Otteniamo la collezione delle attività
		const activityClient: Collection<Activity> =
			await getCollection<Activity>(ACTIVITY_COLLECTION);

		// Otteniamo l'attività
		const outActivity = await findCollectionWrapper<Activity>(
			{
				_id: targetId
			},
			activityClient
		);

		if (outActivity.status !== 200) {
			return outActivity;
		}

		const activity: StringActivity = (await outActivity.json())[0];

		// Aggiungiamo l'utente alla lista degli utenti che hanno accesso all'attività
		activity.userIdList.push(userId);

		// Aggiorniamo l'attività
		const updateOut = await updateCollectionWrapper<Activity>(
			{ _id: activity._id },
			{ $set: { userIdList: activity.userIdList } } as any,
			activityClient
		);

		if (updateOut.status !== 200) {
			return updateOut;
		}

		// Eliminiamo l'invito
		const deleteOut = await deleteCollectionWrapper<Invitation>(
			{ _id: invitationId },
			invitationClient
		);

		if (deleteOut.status !== 200) {
			return deleteOut;
		}

		return generateMessageResponse("Invito accettato", 200);
	} else if (type === "EVENT") {
		// Otteniamo la collezione degli eventi
		const eventClient: Collection<Event> =
			await getCollection<Event>(EVENT_COLLECTION);

		// Otteniamo l'evento
		const outEvent = await findCollectionWrapper<Event>(
			{
				_id: targetId
			},
			eventClient
		);

		if (outEvent.status !== 200) {
			return outEvent;
		}

		const event: StringEvent = (await outEvent.json())[0];

		// Aggiungiamo l'utente alla lista degli utenti che hanno accesso all'evento
		event.userIdList.push(userId);

		// Aggiorniamo l'evento
		const updateOut = await updateCollectionWrapper<Event>(
			{ _id: event._id },
			{ $set: { userIdList: event.userIdList } } as any,
			eventClient
		);

		if (updateOut.status !== 200) {
			return updateOut;
		}

		// Eliminiamo l'invito
		const deleteOut = await deleteCollectionWrapper<Invitation>(
			{ _id: invitationId },
			invitationClient
		);

		if (deleteOut.status !== 200) {
			return deleteOut;
		}

		return generateMessageResponse("Invito accettato", 200);
	} else if (type === "SESSION") {
		// TODO
	} else if (type === "PROJECT") {
		// TODO
	}

	return generateMessageResponse("Not yet implemented", 400);
};
