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

export function convertToCalendarEvents(pulledCalendar: CalendarResponse) {
	const calendarEvents: CalendarEvent[] = [];

	const activities: CalendarEvent[] = pulledCalendar.activities.map(
		(activity) => {
			const start = moment(activity.due).toDate();
			const end = moment(activity.due).toDate();
			return {
				id: activity._id!,
				title: activity.summary,
				start,
				end,
				typology: "activity",
				originalElement: activity,
				isRecurring: false
			};
		}
	);

	const events: CalendarEvent[] = pulledCalendar.events.map((event) => {
		const start = moment(event.dtStart).toDate();
		const end = moment(event.dtEnd).toDate();

		if (event.rrule) {
			// TODO: gestire eventi ricorrenti
		}

		return {
			id: event._id!,
			title: event.summary,
			start,
			end,
			typology: "event",
			originalElement: event,
			isRecurring: false
		};
	});

	const sessions: CalendarEvent[] = pulledCalendar.sessions.map((session) => {
		const start = moment(session.dtStart).toDate();
		const end = moment(session.dtEnd).toDate();

		if (session.rrule) {
			// TODO: gestire sessioni ricorrenti
		}

		return {
			id: session._id!,
			title: session.summary,
			start,
			end,
			typology: "session",
			originalElement: session,
			isRecurring: false
		};
	});

	const projectActivities: CalendarEvent[] =
		pulledCalendar.projectActivities.map((projectActivity) => {
			const start = moment(projectActivity.due).toDate();
			const end = moment(projectActivity.due).toDate();

			return {
				id: projectActivity._id!,
				title: projectActivity.summary,
				start,
				end,
				typology: "projectActivity",
				originalElement: projectActivity,
				isRecurring: false
			};
		});

	calendarEvents.push(
		...activities,
		...events,
		...sessions,
		...projectActivities
	);

	return calendarEvents;
}
