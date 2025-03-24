import { StringEvent, StringSession } from "@/utils/db/db";
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
