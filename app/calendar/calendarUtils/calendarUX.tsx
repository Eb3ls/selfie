import { StandardInput } from "@/app/components/StandardInput";
import { StandardViewField } from "@/app/components/StandardViewFIeld";
import { StringAlarm, Trigger } from "@/utils/db/models/Alarm";
import React from "react";
import { Col, Row } from "react-bootstrap";
import Card from "react-bootstrap/esm/Card";

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

export function getTextFromStatus(status: string): string {
	switch (status) {
		case "TENTATIVE":
			return "Provvisorio";
		case "CONFIRMED":
			return "Confermato";
		case "CANCELLED":
			return "Cancellato";
		case "NEEDS-ACTION":
			return "Da fare";
		case "COMPLETED":
			return "Completata";
		case "IN-PROCESS":
			return "In corso";
		case "CANCELLED":
			return "Cancellata";
		default:
			return status;
	}
}

export function getDeleteContent(
	summary: string,
	handleDelete: () => void,
	type: "ACTIVITY" | "EVENT" | "SESSION"
): JSX.Element {
	let text = "";
	if (type === "SESSION") {
		text = "questa sessione";
	} else if (type === "EVENT") {
		text = "questo evento";
	} else {
		text = "questa attività";
	}
	return (
		<div className="text-center">
			<i className="bi bi-exclamation-triangle text-warning display-1 mb-4 d-block" />
			<h4 className="mb-4">Sei sicuro di voler eliminare {text}</h4>
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

interface PomodoroInputProps {
	cycles: number;
	studyTime: number;
	breakTime: number;
	handleChangePomodoro: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export interface PomodoroBlockProps {
	mode: "edit" | "view";
	cycles: number;
	studyTime: number;
	breakTime: number;
	handleChangePomodoro?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function PomodoroBlock({
	mode,
	cycles,
	studyTime,
	breakTime,
	handleChangePomodoro
}: PomodoroBlockProps) {
	const totalDuration = cycles * (studyTime + breakTime);
	return (
		<Card className="mt-4 mb-3">
			<Card.Header>
				<i className="bi bi-alarm me-2" />
				Impostazioni Pomodoro
			</Card.Header>
			<Card.Body>
				<Row>
					<Col md={4}>
						{mode === "edit" ? (
							<StandardInput
								type="number"
								name="cycles"
								title="Cicli"
								min={1}
								value={cycles}
								onChange={handleChangePomodoro!}
							/>
						) : (
							<StandardViewField title="Cicli" value={cycles} />
						)}
					</Col>
					<Col md={4}>
						{mode === "edit" ? (
							<StandardInput
								type="number"
								name="studyTime"
								title="Studio (min)"
								min={1}
								value={studyTime}
								onChange={handleChangePomodoro!}
							/>
						) : (
							<StandardViewField
								title="Studio (min)"
								value={studyTime}
							/>
						)}
					</Col>
					<Col md={4}>
						{mode === "edit" ? (
							<StandardInput
								type="number"
								name="breakTime"
								title="Pausa (min)"
								min={1}
								value={breakTime}
								onChange={handleChangePomodoro!}
							/>
						) : (
							<StandardViewField
								title="Pausa (min)"
								value={breakTime}
							/>
						)}
					</Col>
				</Row>
				<small className="text-muted mt-2 d-block">
					Durata totale: {totalDuration} minuti
				</small>
			</Card.Body>
		</Card>
	);
}
