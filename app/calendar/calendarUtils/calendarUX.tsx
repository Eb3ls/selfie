import { StringAlarm, Trigger } from "@/utils/db/models/Alarm";
import React from "react";

export function getTextFromTrigger(trigger: Trigger): string {
	switch (trigger) {
		case "-PT0S":
			return "Al momento dell'evento";
		case "-PT10M":
			return "10 minuti prima";
		case "-PT1H":
			return "1 ora prima";
		case "-PT1D":
			return "1 giorno prima";
		default:
			return "";
	}
}

export function getTextFromTriggerList(triggers: StringAlarm[]): string {
	if (triggers.length === 0) {
		return "Nessuno";
	}

	let text = "";
	for (const trigger of triggers) {
		text += getTextFromTrigger(trigger.trigger) + ", ";
	}

	text = text.slice(0, -2);
	return text;
}

export function getDeleteContent(
	summary: string,
	handleDelete: () => void,
	isEvent: boolean
): JSX.Element {
	return (
		<div className="text-center">
			<i className="bi bi-exclamation-triangle text-warning display-1 mb-4 d-block" />
			<h4 className="mb-4">
				Sei sicuro di voler eliminare{" "}
				{isEvent ? "questo evento" : "questa attività"}?
			</h4>
			<p className="mb-4 text-muted">{summary}</p>
			<button
				className="btn btn-danger btn-lg"
				onClick={(e) => {
					e.preventDefault();
					handleDelete();
				}}
			>
				<i className="bi bi-trash me-2" />
				Conferma Eliminazione
			</button>
		</div>
	);
}

export function getDropContent(
	summary: string,
	handleDrop: () => void,
	isEvent: boolean
) {
	return (
		<div className="text-center">
			<i className="bi bi-exclamation-triangle text-warning display-1 mb-4 d-block" />
			<h4 className="mb-4">
				Sei sicuro di voler abbandonare{" "}
				{isEvent ? "questo evento" : "questa attività"}?
			</h4>
			<p className="mb-4 text-muted">{summary}</p>
			<button
				className="btn btn-danger btn-lg"
				onClick={(e) => {
					e.preventDefault();
					handleDrop();
				}}
			>
				<i className="bi bi-x me-2" />
				Conferma Abbandono
			</button>
		</div>
	);
}
