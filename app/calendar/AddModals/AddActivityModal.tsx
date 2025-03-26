"use client";

import { AlarmSelector } from "@/app/calendar/AlarmSelector";
import "@/app/calendar/Modal.css";
import { TimezoneSelector } from "@/app/calendar/TimezoneSelector";
import { useTime } from "@/app/components/TimeContext";
import { StringAlarm } from "@/utils/db/db";
import React, { useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";

export function AddActivityModal({ children }: any) {
	const [show, setShow] = useState(false);
	const [form, setForm] = useState({
		summary: "",
		description: "",
		due: "",
		categories: "",
		location: "",
		geo: "",
		parentActivityId: "",
		usernameList: [] as string[],
		alarms: [] as StringAlarm[]
	});
	const { dateTime } = useTime();

	// Aggiunta dello state per il nome utente corrente
	const [usernameInput, setUsernameInput] = useState("");

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
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

	// Gestisce il submit del form
	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		// Converti la data di consegna in formato ISO
		form.due = new Date(form.due).toISOString();

		// Imposta la data di inizio (dtStart) come la data di creazione (dtStamp)
		const dtStart = dateTime.toISOString();

		// TODO: Implementare la selezione delle attività genitore
		form.parentActivityId = null as any;

		console.log("Form inviato:", { ...form, dtStart });

		const response = await fetch("/api/calendar/activity/add", {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({ ...form, dtStart, status: "NEEDS-ACTION" }) // Includi dtStart e lo stato di default
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

	const handleTimezoneChange = (timezone: string) => {
		setForm({
			...form,
			geo: timezone
		});
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
						<i className="bi bi-person-plus me-2" />
						Nuova Attività
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

						<Form.Group className="mb-3" controlId="formDue">
							<Form.Label>Consegna</Form.Label>
							<Form.Control
								type="datetime-local"
								name="due"
								value={form.due}
								onChange={handleChange}
								className="input-field"
								required
							/>
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

						<TimezoneSelector
							regularTimezone={form.geo}
							setRegularTimezone={handleTimezoneChange}
							firstDateToConvert={{
								text: "Consegna",
								date: form.due
							}}
							secondDateToConvert={undefined}
						/>

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

						<AlarmSelector
							alarms={form.alarms}
							onChange={handleAlarmsChange}
						/>
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
							Crea Attività
						</Button>
					</Modal.Footer>
				</Form>
			</Modal>
		</>
	);
}
