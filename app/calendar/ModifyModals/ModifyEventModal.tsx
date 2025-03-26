"use client";

import { AlarmSelector } from "@/app/calendar/AlarmSelector";
import "@/app/calendar/Modal.css";
import { TimezoneSelector } from "@/app/calendar/TimezoneSelector";
import { StringAlarm, StringEvent } from "@/utils/db/db";
import moment from "moment";
import React, { useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";

type StringEventFrontend = Omit<StringEvent, "userIdList"> & {
	usernameList: string[];
};

export function ModifyEventModal({
	event,
	show,
	setShow
}: {
	event: StringEventFrontend;
	show: boolean;
	setShow: (show: boolean) => void;
}) {
	const newEvent: StringEventFrontend = { ...event };
	const [form, setForm] = useState(newEvent);

	// Aggiungi state per gestire l'input per gli inviti
	const [usernameInput, setUsernameInput] = useState("");

	// Funzione per aggiungere un invito
	const handleAddUsername = () => {
		if (!usernameInput.trim()) return;
		setForm({
			...form,
			usernameList: [...form.usernameList, usernameInput.trim()]
		});
		setUsernameInput("");
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

	// Gestisce il submit del form
	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		// Converti le date in formato ISO
		form.dtStart = new Date(form.dtStart).toISOString();
		form.dtEnd = new Date(form.dtEnd).toISOString();

		const newForm = {
			_id: form._id,
			summary: form.summary,
			description: form.description,
			status: form.status,
			rrule: form.rrule,
			dtStart: form.dtStart,
			dtEnd: form.dtEnd,
			categories: form.categories,
			location: form.location,
			geo: form.geo,
			usernameList: form.usernameList,
			alarms: form.alarms
		};

		console.log("Form inviato:", { ...newForm });

		const response = await fetch("/api/calendar/event/modify", {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({ ...newForm })
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

	async function handleDelete() {
		const response = await fetch("/api/calendar/event/delete", {
			method: "DELETE",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({ _id: form._id })
		});

		if (response.ok) {
			alert("Evento eliminato con successo!");
			window.location.reload();
		}
	}

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
						Modifica Evento
					</Modal.Title>
				</Modal.Header>
				<Form onSubmit={handleSubmit} className="custom-form">
					<Modal.Body>
						<Form.Group className="mb-3" controlId="formFirstName">
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
							<Form.Label>Descrizione</Form.Label>
							<Form.Control
								type="text"
								name="description"
								value={form.description}
								onChange={handleChange}
								placeholder="Inserisci descrizione"
								className="input-field"
								required
							/>
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
								<option value="CANCELLED">Cancellato</option>
							</Form.Select>
							<Form.Label>Data di inizio</Form.Label>
							<Form.Control
								type="datetime-local"
								name="dtStart"
								value={moment(form.dtStart).format(
									"YYYY-MM-DDTHH:mm"
								)}
								onChange={handleChange}
								placeholder="Inserisci data di inizio"
								className="input-field"
								required
							/>
							<Form.Label>Data di fine</Form.Label>
							<Form.Control
								type="datetime-local"
								name="dtEnd"
								value={moment(form.dtEnd).format(
									"YYYY-MM-DDTHH:mm"
								)}
								onChange={handleChange}
								placeholder="Inserisci data di fine"
								className="input-field"
								required
							/>
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
							variant="danger"
							onClick={handleDelete}
							className="custom-cancel-button"
						>
							Elimina
						</Button>
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
							Modifica Evento
						</Button>
					</Modal.Footer>
				</Form>
			</Modal>
		</>
	);
}
