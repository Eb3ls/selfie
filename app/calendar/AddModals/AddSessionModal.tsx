"use client";

import { AlarmSelector } from "@/app/calendar/AlarmSelector";
import "@/app/calendar/Modal.css";
import StandardInput from "@/app/components/StandardInput";
import StandardModal from "@/app/components/StandardModal";
import { StringAlarm } from "@/utils/db/db";
import React, { useState } from "react";
import { Button, Card, Col, Form, Modal, Row } from "react-bootstrap";

// Mappe per la conversione dei valori
const WEEKDAY_MAP: { [key: string]: string } = {
	Lunedì: "MO",
	Martedì: "TU",
	Mercoledì: "WE",
	Giovedì: "TH",
	Venerdì: "FR",
	Sabato: "SA",
	Domenica: "SU"
};

const MONTH_MAP: { [key: string]: string } = {
	Gennaio: "1",
	Febbraio: "2",
	Marzo: "3",
	Aprile: "4",
	Maggio: "5",
	Giugno: "6",
	Luglio: "7",
	Agosto: "8",
	Settembre: "9",
	Ottobre: "10",
	Novembre: "11",
	Dicembre: "12"
};

export function AddSessionModal({ children }: any) {
	const [show, setShow] = useState(false);
	const [recurrenceType, setRecurrenceType] = useState<
		"DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY"
	>("DAILY");
	const [weeklyDays, setWeeklyDays] = useState<string[]>([]);
	const [monthlyDays, setMonthlyDays] = useState<number[]>([]);
	const [yearlyMonths, setYearlyMonths] = useState<string[]>([]);
	const [recurrenceEnd, setRecurrenceEnd] = useState<
		"NEVER" | "UNTIL_EVENT_END" | "COUNT"
	>("NEVER"); // Fine della ripetizione
	const [recurrenceEndDate, setRecurrenceEndDate] = useState("");
	const [recurrenceCount, setRecurrenceCount] = useState<number>(1);

	const [form, setForm] = useState({
		summary: "",
		description: "",
		status: "CONFIRMED",
		rrule: "",
		dtStart: "",
		dtEnd: "",
		settings: {
			cycles: 1,
			studyTime: 1,
			breakTime: 1
		},
		alarms: [] as StringAlarm[]
	});

	const generateRRule = () => {
		let rrule = `FREQ=${recurrenceType}`;

		if (recurrenceType === "WEEKLY" && weeklyDays.length > 0) {
			rrule += `;BYDAY=${weeklyDays.join(",")}`;
		} else if (recurrenceType === "MONTHLY" && monthlyDays.length > 0) {
			rrule += `;BYMONTHDAY=${monthlyDays.join(",")}`;
		} else if (recurrenceType === "YEARLY" && yearlyMonths.length > 0) {
			rrule += `;BYMONTH=${yearlyMonths.join(",")}`;
		}

		if (recurrenceEnd === "COUNT") {
			rrule += `;COUNT=${recurrenceCount}`;
		} else if (recurrenceEnd === "UNTIL_EVENT_END" && recurrenceEndDate) {
			rrule += `;UNTIL=${new Date(recurrenceEndDate).toISOString().replace(/[-:]/g, "").split(".")[0]}Z`;
		}

		return rrule;
	};

	const handleChange = (
		e: React.ChangeEvent<
			HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
		>
	) => {
		setForm({
			...form,
			[e.target.name]: e.target.value
		});
	};

	const handleChangePomodoro = (e: React.ChangeEvent<HTMLInputElement>) => {
		setForm({
			...form,
			settings: {
				...form.settings,
				[e.target.name]: parseInt(e.target.value)
			}
		});
	};

	const handleRecurrenceTypeChange = (
		e: React.ChangeEvent<HTMLSelectElement>
	) => {
		setRecurrenceType(
			e.target.value as "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY"
		);
	};

	const handleWeeklyDaysChange = (day: string) => {
		const mappedDay = WEEKDAY_MAP[day];
		setWeeklyDays((prev) =>
			prev.includes(mappedDay)
				? prev.filter((d) => d !== mappedDay)
				: [...prev, mappedDay]
		);
	};

	const handleMonthlyDaysChange = (day: number) => {
		setMonthlyDays((prev) =>
			prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
		);
	};

	const handleYearlyMonthsChange = (month: string) => {
		const mappedMonth = MONTH_MAP[month];
		setYearlyMonths((prev) =>
			prev.includes(mappedMonth)
				? prev.filter((m) => m !== mappedMonth)
				: [...prev, mappedMonth]
		);
	};

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		const startDateTime = new Date(form.dtStart);
		const pomodoroDuration =
			form.settings.cycles *
			(form.settings.studyTime + form.settings.breakTime);
		const endDateTime = new Date(
			startDateTime.getTime() + pomodoroDuration * 60000
		);

		const formData = {
			summary: form.summary,
			description: form.description,
			status: form.status,
			rrule: generateRRule(),
			dtStart: startDateTime.toISOString(),
			dtEnd: endDateTime.toISOString(),
			settings: {
				cycles: form.settings.cycles,
				studyTime: form.settings.studyTime,
				breakTime: form.settings.breakTime
			},
			alarms: form.alarms
		};

		console.log("Form inviato:", formData);

		const response = await fetch("/api/calendar/session/add", {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify(formData)
		});

		if (response.status === 200) {
			alert("Successful!");
			window.location.reload();
		} else if (response.status === 400) {
			const out = await response.json();
			if (out.message === undefined) {
				alert("Failed! User not found: " + out.users[0]);
			} else {
				alert("Failed! " + out.message);
			}
		} else {
			alert("Failed! Status code: " + response.status);
		}
	};

	const handleAlarmsChange = (newAlarms: StringAlarm[]) => {
		setForm({
			...form,
			alarms: newAlarms
		});
	};

	return (
		<>
			<span onClick={() => setShow(true)} style={{ cursor: "pointer" }}>
				{children}
			</span>

			<StandardModal
				title="Nuova sessione"
				saveBtnText="Crea"
				show={show}
				handleClose={() => setShow(false)}
				handleSubmit={handleSubmit}
			>
				<StandardInput
					type="text"
					name="summary"
					title="Titolo"
					placeholder="Inserisci titolo"
					onChange={handleChange}
					value={form.summary}
				/>

				<StandardInput
					type="textarea"
					name="description"
					title="Descrizione"
					placeholder="Inserisci descrizione"
					onChange={handleChange}
					value={form.description}
					isRequired={false}
				/>

				<StandardInput
					type="select"
					name="status"
					title="Stato"
					onChange={handleChange}
					value={form.status}
					optionMap={{
						TENTATIVE: "Provvisorio",
						CONFIRMED: "Confermato"
					}}
				/>

				<StandardInput
					type="datetime-local"
					name="dtStart"
					title="Data di inizio"
					onChange={handleChange}
					value={form.dtStart}
				/>

				<StandardInput
					type="select"
					name="recurrenceType"
					title="Tipo di ripetizione"
					onChange={handleRecurrenceTypeChange}
					value={recurrenceType}
					optionMap={{
						DAILY: "Giornaliero",
						WEEKLY: "Settimanale",
						MONTHLY: "Mensile",
						YEARLY: "Annuale"
					}}
				/>

				{recurrenceType === "WEEKLY" && (
					<div className="my-3">
						<Form.Label className="fw-bold">
							Giorni della settimana
						</Form.Label>
						<Row>
							{[
								"Lunedì",
								"Martedì",
								"Mercoledì",
								"Giovedì",
								"Venerdì",
								"Sabato",
								"Domenica"
							].map((day) => (
								<Col key={day} xs={6} sm={4} md={3}>
									<Form.Check
										type="checkbox"
										label={day}
										checked={weeklyDays.includes(
											WEEKDAY_MAP[day]
										)}
										onChange={() =>
											handleWeeklyDaysChange(day)
										}
									/>
								</Col>
							))}
						</Row>
					</div>
				)}

				{recurrenceType === "MONTHLY" && (
					<div className="my-3">
						<Form.Label className="fw-bold">
							Giorni del mese
						</Form.Label>
						<Row>
							{Array.from({ length: 31 }, (_, i) => i + 1).map(
								(day) => (
									<Col key={day} xs={6} sm={4} md={3}>
										<Form.Check
											type="checkbox"
											label={day}
											checked={monthlyDays.includes(day)}
											onChange={() =>
												handleMonthlyDaysChange(day)
											}
										/>
									</Col>
								)
							)}
						</Row>
					</div>
				)}

				{recurrenceType === "YEARLY" && (
					<div className="my-3">
						<Form.Label className="fw-bold">Mesi</Form.Label>
						<Row>
							{[
								"Gennaio",
								"Febbraio",
								"Marzo",
								"Aprile",
								"Maggio",
								"Giugno",
								"Luglio",
								"Agosto",
								"Settembre",
								"Ottobre",
								"Novembre",
								"Dicembre"
							].map((month) => (
								<Col key={month} xs={6} sm={4} md={3}>
									<Form.Check
										type="checkbox"
										label={month}
										checked={yearlyMonths.includes(
											MONTH_MAP[month]
										)}
										onChange={() =>
											handleYearlyMonthsChange(month)
										}
									/>
								</Col>
							))}
						</Row>
					</div>
				)}

				<StandardInput
					type="select"
					name="repetitionEnd"
					title="Fine della ripetizione"
					value={recurrenceEnd}
					onChange={(e) => setRecurrenceEnd(e.target.value as any)}
					optionMap={{
						NEVER: "Mai",
						UNTIL_EVENT_END: "Fino a data di fine",
						COUNT: "Dopo un numero di occorrenze"
					}}
				/>

				{recurrenceEnd === "UNTIL_EVENT_END" && (
					<StandardInput
						type="date"
						name="recurrenceEndDate"
						title="Fine ricorrenza"
						value={recurrenceEndDate}
						onChange={(e) => setRecurrenceEndDate(e.target.value)}
					/>
				)}

				{recurrenceEnd === "COUNT" && (
					<StandardInput
						type="number"
						name="recurrenceCount"
						title="Numero di occorrenze"
						value={recurrenceCount}
						onChange={(e) =>
							setRecurrenceCount(parseInt(e.target.value))
						}
						min={1}
					/>
				)}

				<Card className="mt-4 mb-3">
					<Card.Header>
						<i className="bi bi-alarm me-2"></i>
						Impostazioni Pomodoro
					</Card.Header>
					<Card.Body>
						<Row>
							<Col md={4}>
								<StandardInput
									type="number"
									name="cycles"
									title="Cicli"
									min={1}
									value={form.settings.cycles}
									onChange={handleChangePomodoro}
								/>
							</Col>
							<Col md={4}>
								<StandardInput
									type="number"
									name="studyTime"
									title="Studio (min)"
									min={1}
									value={form.settings.studyTime}
									onChange={handleChangePomodoro}
								/>
							</Col>
							<Col md={4}>
								<StandardInput
									type="number"
									name="breakTime"
									title="Pausa (min)"
									min={1}
									value={form.settings.breakTime}
									onChange={handleChangePomodoro}
								/>
							</Col>
						</Row>
						<small className="text-muted mt-2 d-block">
							Durata totale:{" "}
							{form.settings.cycles *
								(form.settings.studyTime +
									form.settings.breakTime)}{" "}
							minuti
						</small>
					</Card.Body>
				</Card>

				<AlarmSelector
					alarms={form.alarms}
					onChange={handleAlarmsChange}
				/>
			</StandardModal>
		</>
	);
}
