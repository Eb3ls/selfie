import { generateRecurringCalendarEvents } from "@/app/calendar/calendarUtils/calendarRRule";
import {
	CalendarEvent,
	StringActivityFrontend,
	StringEventFrontend,
	StringProjectActivityFrontend,
	StringSessionFrontend
} from "@/app/calendar/calendarUtils/calendarTypes";
import moment from "moment";

interface CalendarResponse {
	activities: StringActivityFrontend[];
	events: StringEventFrontend[];
	sessions: StringSessionFrontend[];
	projectActivities: StringProjectActivityFrontend[];
}

export async function fetchCalendar(url: string) {
	const response = await fetch(url);
	if (!response.ok)
		throw new Error("Errore durante il fetch degli elementi!");
	return response.json();
}

export function convertToCalendarEvents(
	pulledCalendar: CalendarResponse,
	currentDate: Date
) {
	const calendarEvents: CalendarEvent[] = [];

	pulledCalendar.activities.forEach((activity) => {
		const start = moment(activity.due).toDate();
		const end = moment(activity.due).toDate();

		calendarEvents.push({
			id: activity._id!,
			title: activity.summary,
			start,
			end,
			typology: "activity",
			originalElement: activity,
			isRecurring: false
		});
	});

	pulledCalendar.events.forEach((event) => {
		const start = moment(event.dtStart).toDate();
		const end = moment(event.dtEnd).toDate();

		if (event.rrule) {
			const recurringEvents = generateRecurringCalendarEvents(
				event,
				"event",
				currentDate
			);
			calendarEvents.push(...recurringEvents);
			return;
		}

		calendarEvents.push({
			id: event._id!,
			title: event.summary,
			start,
			end,
			typology: "event",
			originalElement: event,
			isRecurring: false
		});
	});

	pulledCalendar.sessions.forEach((session) => {
		const start = moment(session.dtStart).toDate();
		const end = moment(session.dtEnd).toDate();

		if (session.rrule) {
			const recurringSessions = generateRecurringCalendarEvents(
				session,
				"session",
				currentDate
			);
			calendarEvents.push(...recurringSessions);
			return;
		}

		calendarEvents.push({
			id: session._id!,
			title: session.summary,
			start,
			end,
			typology: "session",
			originalElement: session,
			isRecurring: false
		});
	});

	pulledCalendar.projectActivities.forEach((projectActivity) => {
		const start = moment(projectActivity.due).toDate();
		const end = moment(projectActivity.due).toDate();

		calendarEvents.push({
			id: projectActivity._id!,
			title: projectActivity.summary,
			start,
			end,
			typology: "projectActivity",
			originalElement: projectActivity,
			isRecurring: false
		});
	});

	return calendarEvents;
}

export function divideResourcesFromUserList(usernameList: string[]) {
	// Questa funzione divide gli utenti in due liste, in base a come inizia il loro nome
	// Se inizia con "[RES]-" allora sono risorse, altrimenti sono utenti normali
	const resources: string[] = [];
	const users: string[] = [];
	for (const username of usernameList) {
		if (username.startsWith("[RES]-")) {
			resources.push(username);
		} else {
			users.push(username);
		}
	}
	// Ritorniamo le due liste
	return { resources, users };
}
