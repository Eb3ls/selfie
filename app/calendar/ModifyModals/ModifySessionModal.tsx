"use client";

import "@/app/calendar/Modal.css";
import { StringSession } from "@/utils/db/db";
import moment from "moment";
import React, { useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";

export function ModifySessionModal({
	session,
	show,
	setShow
}: {
	session: StringSession;
	show: boolean;
	setShow: (show: boolean) => void;
}) {
	const newSession: StringSession = { ...session };
	const [form, setForm] = useState(newSession);

	console.log("Session:", newSession);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setForm({
			...form,
			[e.target.name]: e.target.value
		});
	};

	const handleChangePomodoro = (e: React.ChangeEvent<HTMLInputElement>) => {
		setForm({
			...form,
			settingsList: [
				...form.settingsList.slice(0, form.settingsList.length - 1),
				{
					...form.settingsList[form.settingsList.length - 1],
					[e.target.name]: parseInt(e.target.value)
				}
			]
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
			newSetting: {
				cycles: form.settingsList[form.settingsList.length - 1].cycles,
				studyTime:
					form.settingsList[form.settingsList.length - 1].studyTime,
				breakTime:
					form.settingsList[form.settingsList.length - 1].breakTime
			}
		};

		console.log("Primo form inviato:", { ...newForm });

		const response = await fetch("/api/calendar/session/modify", {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({ ...newForm })
		});

		if (response.ok) {
			alert("Sessione modificata con successo!");
			window.location.reload();
		} else {
			alert("Errore nella modifica della sessione!");
		}
	};

	async function handleDelete() {
		const response = await fetch("/api/calendar/session/delete", {
			method: "DELETE",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({ _id: form._id })
		});

		if (response.ok) {
			alert("Sessione eliminata con successo!");
			window.location.reload();
		}
	}

	function handleRedirect() {
		window.location.href = "/pomodoro?id=" + form._id;
	}

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
						Modifica Sessione
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
							<Form.Control
								type="text"
								name="status"
								value={form.status}
								onChange={handleChange}
								placeholder="Inserisci stato"
								className="input-field"
								required
							/>
							<Form.Label>Data di inizio?</Form.Label>
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
							<br />
							<p>Sezione pomodoro:</p>
							<Form.Label>Cicli pomodoro</Form.Label>
							<Form.Control
								type="number"
								name="cycles"
								value={
									form.settingsList[
										form.settingsList.length - 1
									].cycles
								}
								min={0}
								onChange={handleChangePomodoro}
								placeholder="Inserisci il numero di cicli"
								className="input-field"
								required
							/>
							<Form.Label>Durata studio</Form.Label>
							<Form.Control
								type="number"
								name="studyTime"
								value={
									form.settingsList[
										form.settingsList.length - 1
									].studyTime
								}
								min={1}
								onChange={handleChangePomodoro}
								placeholder="Inserisci la durata dello studio"
								className="input-field"
								required
							/>
							<Form.Label>Durata pausa</Form.Label>
							<Form.Control
								type="number"
								name="breakTime"
								value={
									form.settingsList[
										form.settingsList.length - 1
									].breakTime
								}
								min={1}
								onChange={handleChangePomodoro}
								placeholder="Inserisci la durata della pausa"
								className="input-field"
								required
							/>
						</Form.Group>
					</Modal.Body>
					<Modal.Footer>
						<Button
							variant="success"
							onClick={handleRedirect}
							className="custom-cancel-button"
						>
							Pomi
						</Button>
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
							Modifica Sessione
						</Button>
					</Modal.Footer>
				</Form>
			</Modal>
		</>
	);
}
