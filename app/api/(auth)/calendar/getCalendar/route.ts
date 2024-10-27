import {
	generateMessageResponse,
	generateObjectResponse,
	validate
} from "@/utils/api/api";
import {
	ACTIVITY_COLLECTION,
	Activity,
	EVENT_COLLECTION,
	Event,
	SESSION_COLLECTION,
	Session,
	findCollectionWrapper,
	getCollection
} from "@/utils/db/db";
import { Collection } from "mongodb";
import { NextRequest } from "next/server";

interface CalendarResponse {
	activities: Activity[];
	events: Event[];
	sessions: Session[];
}

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

	// Otteniamo la collezione delle attività
	const activityClient: Collection<Activity> =
		await getCollection<Activity>(ACTIVITY_COLLECTION);

	// Otteniamo la collezione degli eventi
	const eventClient: Collection<Event> =
		await getCollection<Event>(EVENT_COLLECTION);

	// Otteniamo la collezione delle sessioni
	const sessionClient: Collection<Session> =
		await getCollection<Session>(SESSION_COLLECTION);

	// Otteniamo tutte le attività dell'utente
	const outActivity = await findCollectionWrapper<Activity>(
		{ userIdList: { $in: [userId] } } as any,
		activityClient
	);

	let activities: any;

	if (outActivity.status === 500) {
		// Se c'è stato un errore, ritorna un errore
		return outActivity;
	} else if (outActivity.status === 404) {
		activities = [];
	} else {
		activities = await outActivity.json();
	}

	// Otteniamo tutti gli eventi dell'utente
	const outEvent = await findCollectionWrapper<Event>(
		{ userIdList: { $in: [userId] } } as any,
		eventClient
	);

	let events: any;

	if (outEvent.status === 500) {
		// Se c'è stato un errore, ritorna un errore
		return outEvent;
	} else if (outEvent.status === 404) {
		events = [];
	} else {
		events = await outEvent.json();
	}

	// Otteniamo tutte le sessioni dell'utente
	const outSession = await findCollectionWrapper<Session>(
		{ ownerId: userId } as any,
		sessionClient
	);

	let sessions: any;

	if (outSession.status === 500) {
		// Se c'è stato un errore, ritorna un errore
		return outSession;
	} else if (outSession.status === 404) {
		sessions = [];
	} else {
		sessions = await outSession.json();
	}

	// Se arriviamo qui, abbiamo ottenuto 3 array di attività, eventi e sessioni

	const response: CalendarResponse = {
		activities,
		events,
		sessions
	};

	return generateObjectResponse(response, 200);
};
