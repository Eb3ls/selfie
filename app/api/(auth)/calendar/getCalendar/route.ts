import {
	generateMessageResponse,
	generateObjectResponse,
	idListToNameList,
	validate
} from "@/utils/api/api";
import {
	ACTIVITY_COLLECTION,
	Activity,
	EVENT_COLLECTION,
	Event,
	SESSION_COLLECTION,
	Session,
	StringActivity,
	StringEvent,
	StringSession,
	findCollectionWrapper,
	getCollection
} from "@/utils/db/db";
import { Collection } from "mongodb";
import { NextRequest } from "next/server";

type StringActivityFrontend = Omit<StringActivity, "userIdList"> & {
	usernameList: string[];
};

type StringEventFrontend = Omit<StringEvent, "userIdList"> & {
	usernameList: string[];
};

interface CalendarResponse {
	activities: StringActivityFrontend[];
	events: StringEventFrontend[];
	sessions: StringSession[];
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

	let activities: StringActivity[];

	if (outActivity.status === 500) {
		// Se c'è stato un errore, ritorna un errore
		return outActivity;
	} else if (outActivity.status === 404) {
		activities = [];
	} else {
		activities = await outActivity.json();
	}

	let activitiesFrontend: StringActivityFrontend[] = [];

	// Per ogni attività, convertiamo la userIdList in un array di username
	for (const activity of activities) {
		const outNameList = await idListToNameList(activity.userIdList);

		if (outNameList.status !== 200) {
			return outNameList.status;
		}

		const { userIdList: _, ...smallActivity } = activity;

		activitiesFrontend.push({
			...smallActivity,
			usernameList: outNameList.userNameList!
		});
	}

	// Otteniamo tutti gli eventi dell'utente
	const outEvent = await findCollectionWrapper<Event>(
		{ userIdList: { $in: [userId] } } as any,
		eventClient
	);

	let events: StringEvent[];

	if (outEvent.status === 500) {
		// Se c'è stato un errore, ritorna un errore
		return outEvent;
	} else if (outEvent.status === 404) {
		events = [];
	} else {
		events = await outEvent.json();
	}

	let eventsFrontend: StringEventFrontend[] = [];

	// Per ogni evento, convertiamo la userIdList in un array di username
	for (const event of events) {
		const outNameList = await idListToNameList(event.userIdList);

		if (outNameList.status !== 200) {
			return outNameList.status;
		}

		const { userIdList: _, ...smallEvent } = event;

		eventsFrontend.push({
			...smallEvent,
			usernameList: outNameList.userNameList!
		});
	}

	// Otteniamo tutte le sessioni dell'utente
	const outSession = await findCollectionWrapper<Session>(
		{ ownerId: userId } as any,
		sessionClient
	);

	let sessions: StringSession[];

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
		activities: activitiesFrontend,
		events: eventsFrontend,
		sessions
	};

	return generateObjectResponse(response, 200);
};
