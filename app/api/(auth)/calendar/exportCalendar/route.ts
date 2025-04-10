import { generateMessageResponse, validate } from "@/utils/api/api";
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
import { EventAttributes, createEvents } from "ics";
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

	// Otteniamo la collezione delle attività
	const activityClient: Collection<Activity> =
		await getCollection<Activity>(ACTIVITY_COLLECTION);

	// Otteniamo la collezione degli eventi
	const eventClient: Collection<Event> =
		await getCollection<Event>(EVENT_COLLECTION);

	// Otteniamo la collezione delle sessioni
	const sessionClient: Collection<Session> =
		await getCollection<Session>(SESSION_COLLECTION);

	// Otteniamo la collezione delle project activities
	const projectActivityClient: Collection<ProjectActivity> =
		await getCollection<ProjectActivity>(PROJECT_ACTIVITY_COLLECTION);

	// Otteniamo tutte le attività dell'utente
	const outActivity = await findCollectionWrapper<Activity>(
		{ userIdList: { $in: [userId] } as any },
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

	// Otteniamo tutti gli eventi dell'utente
	const outEvent = await findCollectionWrapper<Event>(
		{ userIdList: { $in: [userId] } as any },
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

	// Otteniamo tutte le project activities dell'utente
	const outProjectActivity = await findCollectionWrapper<ProjectActivity>(
		{ userIdList: { $in: [userId] } as any },
		projectActivityClient
	);

	let projectActivities: StringProjectActivity[];

	if (outProjectActivity.status === 500) {
		// Se c'è stato un errore, ritorna un errore
		return outProjectActivity;
	} else if (outProjectActivity.status === 404) {
		projectActivities = [];
	} else {
		projectActivities = await outProjectActivity.json();
	}

	// Se arriviamo qui, abbiamo ottenuto 4 array: attività, eventi, sessioni e project activities
	// Trasformiamo gli array in un unico array di eventi ICS
	const allItems = [
		...activities,
		...events,
		...sessions,
		...projectActivities
	];
	const icsEvents = allItems.map((item) => {
		const start = new Date(item.dtStart);

		// Se l'oggetto è una attività, l'end è la due e non la dtEnd
		const end = "dtEnd" in item ? new Date(item.dtEnd) : new Date(item.due);

		let recurrenceRule = undefined;
		if ("rrule" in item && item.rrule !== "") {
			recurrenceRule = item.rrule;
		}

		let categories: string[] = [];
		if ("categories" in item) {
			categories = item.categories.split(",");
		}

		let location: string | undefined = undefined;
		if ("location" in item) {
			location = item.location;
		}

		const out: EventAttributes = {
			title: item.summary,
			description: item.description,
			recurrenceRule: recurrenceRule,
			start: [
				start.getFullYear(),
				start.getMonth() + 1,
				start.getDate(),
				start.getHours(),
				start.getMinutes()
			],
			end: [
				end.getFullYear(),
				end.getMonth() + 1,
				end.getDate(),
				end.getHours(),
				end.getMinutes()
			],
			categories: categories,
			location: location
		};

		return out;
	});

	const { error, value } = await new Promise<{ error: any; value: string }>(
		(resolve) => {
			createEvents(icsEvents, (error, value) =>
				resolve({ error, value })
			);
		}
	);
	if (error) {
		return generateMessageResponse("Error generating ICS", 500);
	}
	return new Response(value, {
		status: 200,
		headers: {
			"Content-Type": "text/calendar",
			"Content-Disposition": 'attachment; filename="calendar.ics"'
		}
	});
};
