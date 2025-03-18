import { generateMessageResponse, validate } from "@/utils/api/api";
import {
	ACTIVITY_COLLECTION,
	Activity,
	EVENT_COLLECTION,
	Event,
	INVITATION_COLLECTION,
	Invitation,
	SESSION_COLLECTION,
	Session,
	StringActivity,
	StringEvent,
	StringInvitation,
	StringSession,
	addCollectionWrapper,
	deleteCollectionWrapper,
	findCollectionWrapper,
	getCollection,
	updateCollectionWrapper
} from "@/utils/db/db";
import { timeMachine } from "@/utils/timeMachine/timeMachine";
import { Collection } from "mongodb";
import { NextRequest } from "next/server";
import { rrulestr } from "rrule";

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
		// Otteniamo la collezione delle sessioni
		const sessionClient: Collection<Session> =
			await getCollection<Session>(SESSION_COLLECTION);

		// Otteniamo la sessione
		const outSession = await findCollectionWrapper<Session>(
			{
				_id: targetId
			},
			sessionClient
		);

		if (outSession.status !== 200) {
			return outSession;
		}

		const session: StringSession = (await outSession.json())[0];

		// Dobbiamo duplicare la sessione e aggiungerla all'utente
		// Dobbiamo impostare le date di inizio in modo tale che la sessione abbia le stesse occorrenze
		// con le rrule.
		// Per farlo troviamo la prossima occorrenza della sessione e impostiamo la data di inizio
		// della nuova sessione a quella data.
		// Non importa che impostiamo anche la data di fine perchè va bene che la sessione finisca allo stesso
		// giorno della sessione originale.

		const rule = rrulestr(session.rrule, {
			dtstart: new Date(session.dtStart)
		});

		// Prendiamo il tempo attuale dalla time machine
		const timeNow = timeMachine.timeMachineTime;

		// Durata della sessione
		const duration =
			new Date(session.dtEnd).getTime() -
			new Date(session.dtStart).getTime();

		// Se la data di inizio della sessione è nel futuro, la prossima occorrenza è quella
		// della data di inizio della sessione.
		const nextOccurrence = rule.after(timeNow, true);

		if (nextOccurrence === null) {
			return generateMessageResponse("La sessione è scaduta", 400);
		}

		// Assumiamo che ci sia almeno una impostazione
		const lastSetting =
			session.settingsList[session.settingsList.length - 1];

		lastSetting.modificationDate = timeNow.toDateString();

		// Creiamo la nuova sessione
		const newSession: StringSession = {
			ownerId: userId,
			summary: session.summary,
			description: session.description,
			status: session.status,
			rrule: session.rrule,
			dtStart: nextOccurrence.toISOString(),
			dtEnd: new Date(nextOccurrence.getTime() + duration).toISOString(),
			dtStamp: timeNow.toISOString(),
			settingsList: [lastSetting],
			completedCycles: []
		};

		// Inseriamo la nuova sessione
		const insertOut = await addCollectionWrapper<Session>(
			newSession,
			sessionClient
		);

		if (insertOut.status !== 200) {
			return insertOut;
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
	} else if (type === "PROJECT") {
		// TODO
	}

	return generateMessageResponse("Not yet implemented", 400);
};
