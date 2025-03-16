import {
	CalendarEvent,
	StringEventFrontend,
	StringSessionFrontend
} from "@/app/calendar/calendarUtils/calendarTypes";
import { rrulestr } from "rrule";

export function generateRecurringCalendarEvents(
	originalEvent: StringEventFrontend | StringSessionFrontend,
	eventType: "event" | "session",
	currentDate: Date
): CalendarEvent[] {
	const calendarEvents: CalendarEvent[] = [];
	const start = new Date(originalEvent.dtStart);
	const end = new Date(originalEvent.dtEnd);
	const duration = end.getTime() - start.getTime();
	const rrule = originalEvent.rrule;

	// Vogliamo generare tutti gli eventi ricorrenti in un range che va
	// dal primo del mese corrente all'ultimo del mese successivo

	// Primo giorno del mese precedente
	const firstDayPrevMonth = new Date(
		currentDate.getFullYear(),
		currentDate.getMonth() - 1,
		1
	);

	// Ultimo giorno del mese successivo
	const lastDayNextMonth = new Date(
		currentDate.getFullYear(),
		currentDate.getMonth() + 2,
		0
	);

	const rule = rrulestr(rrule, { dtstart: new Date(start) });

	const occurrences = rule.between(firstDayPrevMonth, lastDayNextMonth);

	occurrences.forEach((date) => {
		const newEvent: CalendarEvent = {
			id: originalEvent._id!,
			title: originalEvent.summary,
			start: date,
			end: new Date(date.getTime() + duration),
			typology: eventType,
			originalElement: originalEvent,
			isRecurring: true
		};
		calendarEvents.push(newEvent);
	});

	return calendarEvents;
}
