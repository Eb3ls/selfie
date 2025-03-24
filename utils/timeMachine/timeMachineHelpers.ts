import {
	StringActivity,
	StringEvent,
	StringProjectActivity,
	StringSession
} from "@/utils/db/db";
import {
	AT_THE_TIME,
	ONE_DAY_BEFORE,
	ONE_HOUR_BEFORE,
	TEN_MINUTES_BEFORE,
	Trigger
} from "@/utils/db/models/Alarm";
import { sendNotification } from "@/utils/notification/notification_server";
import { rrulestr } from "rrule";

export function areInTheSameMinute(first: Date, second: Date): boolean {
	return (
		first.getTime() <= second.getTime() &&
		first.getTime() >= second.getTime() - 1000
	);
}

export function checkIfIsInRecurrence(
	originalEvent: StringEvent | StringSession,
	currentDate: Date
): boolean {
	const start = new Date(originalEvent.dtStart);
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

	// Se nelle occorrenze c'è la data entro il secondo attuale allora true
	for (const occurrence of occurrences) {
		if (areInTheSameMinute(occurrence, currentDate)) {
			return true;
		}
	}

	return false;
}

export async function sendTimeMachineNotification(
	who: string,
	type: "activity" | "event" | "session" | "projectActivity",
	summary: string
) {
	let title = "";

	if (type === "activity") {
		title = "Notifica attività";
	} else if (type === "event") {
		title = "Notifica evento";
	} else if (type === "session") {
		title = "Notifica sessione";
	} else if (type === "projectActivity") {
		title = "Notifica attività di progetto";
	}

	let body = "";

	if (type === "activity") {
		body = `L'attività ${summary} è scaduta!`;
	} else if (type === "event") {
		body = `L'evento ${summary} è iniziato!`;
	} else if (type === "session") {
		body = `La sessione ${summary} è iniziata!`;
	} else if (type === "projectActivity") {
		body = `L'attività di progetto ${summary} è scaduta!`;
	}

	const notificationData = {
		title: title,
		body: body,
		image: "Sloth.png",
		icon: "",
		url: "/calendar"
	};

	// Inviamo la notifica
	await sendNotification(who, notificationData);
}

function moveDate(date: string, trigger: Trigger): Date {
	const newDate = new Date(date);

	if (trigger === ONE_DAY_BEFORE) {
		newDate.setUTCDate(newDate.getUTCDate() - 1);
	} else if (trigger === ONE_HOUR_BEFORE) {
		newDate.setUTCHours(newDate.getUTCHours() - 1);
	} else if (trigger === TEN_MINUTES_BEFORE) {
		newDate.setUTCMinutes(newDate.getUTCMinutes() - 10);
	} else if (trigger === AT_THE_TIME) {
		// Do nothing
	}

	return newDate;
}

export function applyAlarmsActivities<
	T extends StringActivity | StringProjectActivity
>(activity: T) {
	const newActivities: T[] = [];

	for (const alarm of activity.alarms) {
		let newActivity = { ...activity } as any;

		newActivity.due = moveDate(activity.due, alarm.trigger).toISOString();

		newActivities.push(newActivity);
	}

	return newActivities;
}

export function applyAlarmsEvents<T extends StringEvent | StringSession>(
	event: T
) {
	const newEvents: T[] = [];

	for (const alarm of event.alarms) {
		let newEvent = { ...event } as any;

		newEvent.dtStart = moveDate(event.dtStart, alarm.trigger).toISOString();

		newEvents.push(newEvent);
	}

	return newEvents;
}
