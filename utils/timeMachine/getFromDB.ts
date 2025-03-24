import {
	ACTIVITY_COLLECTION,
	Activity,
	EVENT_COLLECTION,
	Event,
	PROJECT_ACTIVITY_COLLECTION,
	ProjectActivity,
	SESSION_COLLECTION,
	Session,
	StringActivity,
	StringEvent,
	StringProjectActivity,
	StringSession,
	findCollectionWrapper,
	getCollection
} from "@/utils/db/db";
import {
	areInTheSameMinute,
	checkIfIsInRecurrence,
	sendTimeMachineNotification
} from "@/utils/timeMachine/timeMachineHelpers";
import { Collection } from "mongodb";

/* Attività */

async function notifyAllActivities(time: Date) {
	// Ottieniamo la collezione delle attività
	const client: Collection<Activity> =
		await getCollection<Activity>(ACTIVITY_COLLECTION);

	// Otteniamo tutte le attività
	const out = await findCollectionWrapper<Activity>({}, client);

	if (out.status !== 200) {
		return;
	}

	const activities: StringActivity[] = await out.json();

	// Filtriamo le attività che finiscono entro il secondo attuale
	const filtered_activities = activities.filter((activity) => {
		return areInTheSameMinute(new Date(activity.due), time);
	});

	for (const activity of filtered_activities) {
		// Non facciamo await qui, perché non ci interessa aspettare che la funzione finisca
		// prima di passare alla prossima iterazione
		sendTimeMachineNotification(
			activity.ownerId,
			"activity",
			activity.summary
		);
	}
}

/* Eventi */

async function notifyAllEvents(time: Date) {
	// Ottieniamo la collezione degli eventi
	const client: Collection<Event> =
		await getCollection<Event>(EVENT_COLLECTION);

	// Ottieniamo tutti gli eventi
	const out = await findCollectionWrapper<Event>({}, client);

	if (out.status !== 200) {
		return;
	}

	const events: StringEvent[] = await out.json();

	// Filtriamo gli eventi che finiscono entro il secondo attuale
	const filtered_events = events.filter((event) => {
		if (event.rrule) {
			return checkIfIsInRecurrence(event, time);
		} else {
			return areInTheSameMinute(new Date(event.dtStart), time);
		}
	});

	for (const event of filtered_events) {
		// Non facciamo await qui, perché non ci interessa aspettare che la funzione finisca
		// prima di passare alla prossima iterazione
		sendTimeMachineNotification(event.ownerId, "event", event.summary);
	}
}

/* Sessioni */

async function notifyAllSessions(time: Date) {
	// Ottieniamo la collezione delle sessioni
	const client: Collection<Session> =
		await getCollection<Session>(SESSION_COLLECTION);

	// Ottieniamo tutte le sessioni
	const out = await findCollectionWrapper<Session>({}, client);

	if (out.status !== 200) {
		return;
	}

	const sessions: StringSession[] = await out.json();

	// Filtriamo le sessioni che finiscono entro il secondo attuale
	const filtered_sessions = sessions.filter((session) => {
		if (session.rrule) {
			return checkIfIsInRecurrence(session, time);
		} else {
			return areInTheSameMinute(new Date(session.dtStart), time);
		}
	});

	for (const session of filtered_sessions) {
		// Non facciamo await qui, perché non ci interessa aspettare che la funzione finisca
		// prima di passare alla prossima iterazione
		sendTimeMachineNotification(
			session.ownerId,
			"session",
			session.summary
		);
	}
}

/* ProjectActivity */

async function notifyAllProjectActivities(time: Date) {
	// Ottieniamo la collezione delle project activities
	const client: Collection<ProjectActivity> =
		await getCollection<ProjectActivity>(PROJECT_ACTIVITY_COLLECTION);

	// Ottieniamo tutte le project activities
	const out = await findCollectionWrapper<ProjectActivity>({}, client);

	if (out.status !== 200) {
		return;
	}

	const projectActivities: StringProjectActivity[] = await out.json();

	// Filtriamo le project activities che finiscono entro il secondo attuale
	const filtered_projectActivities = projectActivities.filter(
		(projectActivity) => {
			return areInTheSameMinute(new Date(projectActivity.due), time);
		}
	);

	for (const projectActivity of filtered_projectActivities) {
		// Non facciamo await qui, perché non ci interessa aspettare che la funzione finisca
		// prima di passare alla prossima iterazione
		sendTimeMachineNotification(
			projectActivity.ownerId,
			"projectActivity",
			projectActivity.summary
		);
	}
}

/* Funzione per raggruppare tutti i controlli delle notifiche */

export async function notifyAll(time: Date) {
	// Avvio simultaneo delle funzioni senza await
	const p1 = notifyAllActivities(time);
	const p2 = notifyAllEvents(time);
	const p3 = notifyAllSessions(time);
	const p4 = notifyAllProjectActivities(time);

	// Attendo la risoluzione di tutte le promise
	await Promise.all([p1, p2, p3, p4]);
}
