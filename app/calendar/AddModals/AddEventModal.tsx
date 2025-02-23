"use client";

import "@/app/calendar/Modal.css";
import React, { useState } from "react";
import { Button, Col, Form, Modal, Row } from "react-bootstrap";

export function AddEventModal({ children }: any) {
	const [show, setShow] = useState(false);
	const [enableRecurrence, setEnableRecurrence] = useState(false); // Stato per abilitare/disabilitare la ripetizione
	const [recurrenceType, setRecurrenceType] = useState<
		"DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY"
	>("DAILY"); // Tipo di ripetizione
	const [recurrenceEnd, setRecurrenceEnd] = useState<
		"NEVER" | "UNTIL_EVENT_END" | "COUNT"
	>("NEVER"); // Fine della ripetizione
	const [recurrenceCount, setRecurrenceCount] = useState<number>(1); // Numero di occorrenze
	const [weeklyDays, setWeeklyDays] = useState<string[]>([]); // Giorni della settimana per ripetizione settimanale
	const [monthlyDays, setMonthlyDays] = useState<number[]>([]); // Giorni del mese per ripetizione mensile
	const [yearlyMonths, setYearlyMonths] = useState<string[]>([]); // Mesi per ripetizione annuale

	const [form, setForm] = useState({
		summary: "",
		description: "",
		status: "TENTATIVE", // Stato predefinito
		rrule: "",
		dtStart: "",
		dtEnd: "",
		categories: "", // Ora è una stringa
		location: "",
		geo: "",
		usernameList: [] as string[],
		alarms: []
	});

	// Aggiunta dello state per il nome utente corrente
	const [usernameInput, setUsernameInput] = useState("");

	const handleChange = (
		e: React.ChangeEvent<
			HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
		>
	) => {
		const { name, value } = e.target;
		setForm({
			...form,
			[name]: value
		});
	};

	// Nuova funzione per aggiungere username alla lista
	const handleAddUsername = () => {
		if (!usernameInput.trim()) return;
		setForm({
			...form,
			usernameList: [...form.usernameList, usernameInput.trim()]
		});
		setUsernameInput("");
	};

	const handleRecurrenceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setEnableRecurrence(e.target.checked);
		if (!e.target.checked) {
			setForm({ ...form, rrule: "" }); // Resetta l'rrule se la ripetizione è disabilitata
		}
	};

	const handleRecurrenceTypeChange = (
		e: React.ChangeEvent<HTMLSelectElement>
	) => {
		setRecurrenceType(
			e.target.value as "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY"
		);
	};

	const handleRecurrenceEndChange = (
		e: React.ChangeEvent<HTMLSelectElement>
	) => {
		setRecurrenceEnd(
			e.target.value as "NEVER" | "UNTIL_EVENT_END" | "COUNT"
		);
	};

	const handleWeeklyDaysChange = (day: string) => {
		setWeeklyDays((prev) =>
			prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
		);
	};

	const handleMonthlyDaysChange = (day: number) => {
		setMonthlyDays((prev) =>
			prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
		);
	};

	const handleYearlyMonthsChange = (month: string) => {
		setYearlyMonths((prev) =>
			prev.includes(month)
				? prev.filter((m) => m !== month)
				: [...prev, month]
		);
	};

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
		} else if (recurrenceEnd === "UNTIL_EVENT_END" && form.dtEnd) {
			rrule += `;UNTIL=${new Date(form.dtEnd).toISOString().replace(/[-:]/g, "").split(".")[0]}Z`;
		}

		return rrule;
	};

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		// Converti le date in formato ISO
		form.dtStart = new Date(form.dtStart).toISOString();
		form.dtEnd = new Date(form.dtEnd).toISOString();

		// Genera l'rrule se la ripetizione è abilitata
		if (enableRecurrence) {
			form.rrule = generateRRule();
		}

		console.log("Form inviato:", { ...form });

		const response = await fetch("/api/calendar/event/add", {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({ ...form })
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
			{/* Bottone per aprire il modal */}
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
						<i className="bi bi-calendar-event me-2" />
						Nuovo Evento
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
								<option value="TENTATIVE">Provvisorio</option>
								<option value="CONFIRMED">Confermato</option>
							</Form.Select>
						</Form.Group>

						<Form.Group className="mb-3" controlId="formDtStart">
							<Form.Label>Data di inizio</Form.Label>
							<Form.Control
								type="datetime-local"
								name="dtStart"
								value={form.dtStart}
								onChange={handleChange}
								className="input-field"
								required
							/>
						</Form.Group>

						<Form.Group className="mb-3" controlId="formDtEnd">
							<Form.Label>Data di fine</Form.Label>
							<Form.Control
								type="datetime-local"
								name="dtEnd"
								value={form.dtEnd}
								onChange={handleChange}
								className="input-field"
								required
							/>
						</Form.Group>

						<Form.Group className="mb-3" controlId="formRecurrence">
							<Form.Check
								type="checkbox"
								label="Abilita ripetizione"
								checked={enableRecurrence}
								onChange={handleRecurrenceChange}
							/>
							{enableRecurrence && (
								<div className="mt-3">
									<Form.Label>Tipo di ripetizione</Form.Label>
									<Form.Select
										value={recurrenceType}
										onChange={handleRecurrenceTypeChange}
										className="input-field"
									>
										<option value="DAILY">
											Giornaliero
										</option>
										<option value="WEEKLY">
											Settimanale
										</option>
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
													<Col
														key={day}
														xs={6}
														sm={4}
														md={3}
													>
														<Form.Check
															type="checkbox"
															label={day}
															checked={weeklyDays.includes(
																day
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
											<Form.Label>
												Giorni del mese
											</Form.Label>
											<Row>
												{Array.from(
													{ length: 31 },
													(_, i) => i + 1
												).map((day) => (
													<Col
														key={day}
														xs={6}
														sm={4}
														md={3}
													>
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
																month
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

									<Form.Label className="mt-3">
										Fine della ripetizione
									</Form.Label>
									<Form.Select
										value={recurrenceEnd}
										onChange={handleRecurrenceEndChange}
										className="input-field"
									>
										<option value="NEVER">Mai</option>
										<option value="UNTIL_EVENT_END">
											Fino a data di fine
										</option>
										<option value="COUNT">
											Dopo un numero di occorrenze
										</option>
									</Form.Select>

									{recurrenceEnd === "COUNT" && (
										<div className="mt-3">
											<Form.Label>
												Numero di occorrenze
											</Form.Label>
											<Form.Control
												type="number"
												value={recurrenceCount}
												onChange={(e) =>
													setRecurrenceCount(
														parseInt(e.target.value)
													)
												}
												min="1"
												className="input-field"
											/>
										</div>
									)}
								</div>
							)}
						</Form.Group>

						<Form.Group className="mb-3" controlId="formCategories">
							<Form.Label>
								Categorie (separate da virgola)
							</Form.Label>
							<Form.Control
								type="text"
								name="categories"
								value={form.categories}
								onChange={handleChange}
								placeholder="Inserisci categorie"
								className="input-field"
							/>
						</Form.Group>

						<Form.Group className="mb-3" controlId="formLocation">
							<Form.Label>Luogo</Form.Label>
							<Form.Control
								type="text"
								name="location"
								value={form.location}
								onChange={handleChange}
								placeholder="Inserisci luogo"
								className="input-field"
							/>
						</Form.Group>

						<Form.Group className="mb-3" controlId="formGeo">
							<Form.Label>Geolocalizzazione</Form.Label>
							<Form.Control
								type="text"
								name="geo"
								value={form.geo}
								onChange={handleChange}
								placeholder="Inserisci geolocalizzazione"
								className="input-field"
							/>
						</Form.Group>

						{/* Nuovo Form.Group per aggiungere inviti */}
						<Form.Group className="mb-3" controlId="formUsernames">
							<Form.Label>Inviti</Form.Label>
							<div className="d-flex">
								<Form.Control
									type="text"
									value={usernameInput}
									onChange={(e) =>
										setUsernameInput(e.target.value)
									}
									placeholder="Inserisci nome utente"
									className="input-field"
								/>
								<Button
									variant="success"
									onClick={handleAddUsername}
									style={{ marginLeft: "10px" }}
									type="button"
								>
									+
								</Button>
							</div>
							{form.usernameList.length > 0 && (
								<ul>
									{form.usernameList.map(
										(username, index) => (
											<li key={index}>{username}</li>
										)
									)}
								</ul>
							)}
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
							Crea Evento
						</Button>
					</Modal.Footer>
				</Form>
			</Modal>
		</>
	);
}
