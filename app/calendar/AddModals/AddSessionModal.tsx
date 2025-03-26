"use client";

import "@/app/calendar/Modal.css";
import React, { useState } from "react";
import { Button, Col, Form, Modal, Row } from "react-bootstrap";

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
	const [recurrenceEndDate, setRecurrenceEndDate] = useState("");

	const [form, setForm] = useState({
		summary: "",
		description: "",
		status: "CONFIRMED",
		rrule: "",
		dtStartDate: "",
		dtStartTime: "",
		settings: {
			cycles: 0,
			studyTime: 1,
			breakTime: 1
		}
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

		if (recurrenceEndDate) {
			const untilDate = new Date(`${recurrenceEndDate}T23:59:59`);
			const untilString =
				untilDate.toISOString().replace(/[-:]/g, "").split(".")[0] +
				"Z";
			rrule += `;UNTIL=${untilString}`;
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

		const startDateTime = new Date(
			`${form.dtStartDate}T${form.dtStartTime}`
		);
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
			}
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

	return (
		<>
			<span onClick={() => setShow(true)} style={{ cursor: "pointer" }}>
				{children}
			</span>

			<Modal
				show={show}
				onHide={() => setShow(false)}
				centered
				dialogClassName="custom-modal"
				backdropClassName="custom-backdrop"
				fullscreen="lg-down"
			>
				<Modal.Header closeButton className="custom-modal-header">
					<Modal.Title>
						<i className="bi bi-person-plus me-2" />
						Nuova Sessione
					</Modal.Title>
				</Modal.Header>
				<Form onSubmit={handleSubmit} className="custom-form">
					<Modal.Body>
						<Form.Group className="mb-3" controlId="formSummary">
							<Form.Label>Titolo</Form.Label>
							<Form.Control
								type="text"
								name="summary"
								value={form.summary}
								onChange={handleChange}
								placeholder="Inserisci titolo"
								className="input-field"
								required
							/>
						</Form.Group>

						<Form.Group
							className="mb-3"
							controlId="formDescription"
						>
							<Form.Label>Descrizione</Form.Label>
							<Form.Control
								as="textarea"
								name="description"
								value={form.description}
								onChange={handleChange}
								placeholder="Inserisci descrizione"
								className="input-field"
								required
							/>
						</Form.Group>

						<Form.Group className="mb-3" controlId="formStatus">
							<Form.Label>Stato</Form.Label>
							<Form.Select
								name="status"
								value={form.status}
								onChange={handleChange}
								className="input-field"
								required
							>
								<option value="CONFIRMED">Confermato</option>
								<option value="TENTATIVE">Provvisorio</option>
								<option value="CANCELLED">Cancellato</option>
							</Form.Select>
						</Form.Group>

						<Form.Group
							className="mb-3"
							controlId="formDtStartDate"
						>
							<Form.Label>Data di inizio</Form.Label>
							<Form.Control
								type="date"
								name="dtStartDate"
								value={form.dtStartDate}
								onChange={handleChange}
								className="input-field"
								required
							/>
						</Form.Group>

						<Form.Group
							className="mb-3"
							controlId="formDtStartTime"
						>
							<Form.Label>Orario di inizio</Form.Label>
							<Form.Control
								type="time"
								name="dtStartTime"
								value={form.dtStartTime}
								onChange={handleChange}
								className="input-field"
								required
							/>
						</Form.Group>

						<Form.Group className="mb-3" controlId="formRecurrence">
							<Form.Label>Tipo di ripetizione</Form.Label>
							<Form.Select
								value={recurrenceType}
								onChange={handleRecurrenceTypeChange}
								className="input-field"
								required
							>
								<option value="DAILY">Giornaliero</option>
								<option value="WEEKLY">Settimanale</option>
								<option value="MONTHLY">Mensile</option>
								<option value="YEARLY">Annuale</option>
							</Form.Select>

							{recurrenceType === "WEEKLY" && (
								<div className="mt-3">
									<Form.Label>
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
														handleWeeklyDaysChange(
															day
														)
													}
												/>
											</Col>
										))}
									</Row>
								</div>
							)}

							{recurrenceType === "MONTHLY" && (
								<div className="mt-3">
									<Form.Label>Giorni del mese</Form.Label>
									<Row>
										{Array.from(
											{ length: 31 },
											(_, i) => i + 1
										).map((day) => (
											<Col key={day} xs={6} sm={4} md={3}>
												<Form.Check
													type="checkbox"
													label={day}
													checked={monthlyDays.includes(
														day
													)}
													onChange={() =>
														handleMonthlyDaysChange(
															day
														)
													}
												/>
											</Col>
										))}
									</Row>
								</div>
							)}

							{recurrenceType === "YEARLY" && (
								<div className="mt-3">
									<Form.Label>Mesi</Form.Label>
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
											<Col
												key={month}
												xs={6}
												sm={4}
												md={3}
											>
												<Form.Check
													type="checkbox"
													label={month}
													checked={yearlyMonths.includes(
														MONTH_MAP[month]
													)}
													onChange={() =>
														handleYearlyMonthsChange(
															month
														)
													}
												/>
											</Col>
										))}
									</Row>
								</div>
							)}
						</Form.Group>

						<Form.Group
							className="mb-3"
							controlId="formRecurrenceEnd"
						>
							<Form.Label>Fine ricorrenza (opzionale)</Form.Label>
							<Form.Control
								type="date"
								value={recurrenceEndDate}
								onChange={(e) =>
									setRecurrenceEndDate(e.target.value)
								}
							/>
						</Form.Group>

						<Form.Group className="mb-3">
							<p>Impostazioni Pomodoro:</p>
							<Form.Label>Cicli pomodoro</Form.Label>
							<Form.Control
								type="number"
								name="cycles"
								value={form.settings.cycles}
								min={0}
								onChange={handleChangePomodoro}
								className="input-field"
								required
							/>

							<Form.Label>Durata studio (minuti)</Form.Label>
							<Form.Control
								type="number"
								name="studyTime"
								value={form.settings.studyTime}
								min={1}
								onChange={handleChangePomodoro}
								className="input-field"
								required
							/>

							<Form.Label>Durata pausa (minuti)</Form.Label>
							<Form.Control
								type="number"
								name="breakTime"
								value={form.settings.breakTime}
								min={1}
								onChange={handleChangePomodoro}
								className="input-field"
								required
							/>
						</Form.Group>
					</Modal.Body>
					<Modal.Footer>
						<Button
							variant="secondary"
							onClick={() => setShow(false)}
							className="custom-cancel-button"
						>
							Annulla
						</Button>
						<Button
							variant="primary"
							type="submit"
							className="custom-submit-button"
						>
							Crea Sessione
						</Button>
					</Modal.Footer>
				</Form>
			</Modal>
		</>
	);
}
