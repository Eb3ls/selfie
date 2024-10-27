"use client";

import "@/app/calendar/Modal.css";
import { StringSession } from "@/utils/db/db";
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
	newSession.dtStart = new Date(newSession.dtStart)
		.toISOString()
		.slice(0, 16);
	newSession.dtEnd = new Date(newSession.dtEnd).toISOString().slice(0, 16);
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
			pomodoro: {
				...form.pomodoro,
				[e.target.name]: parseInt(e.target.value)
			}
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
			dtStart: form.dtStart,
			dtEnd: form.dtEnd
		};

		console.log("Primo form inviato:", { ...newForm });

		const response = await fetch("/api/calendar/session/modify", {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({ ...newForm })
		});

		if (response.status === 200) {
			const newForm = {
				_id: form._id,
				cycles: form.pomodoro.cycles
			};

			console.log("Secondo form inviato:", { ...newForm });

			const response = await fetch(
				"/api/calendar/session/modifyPomodoro",
				{
					method: "PATCH",
					headers: {
						"Content-Type": "application/json"
					},
					body: JSON.stringify({ ...newForm })
				}
			);
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
								value={form.dtStart}
								onChange={handleChange}
								placeholder="Inserisci data di inizio"
								className="input-field"
								required
							/>
							<Form.Label>Data di fine</Form.Label>
							<Form.Control
								type="datetime-local"
								name="dtEnd"
								value={form.dtEnd}
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
								value={form.pomodoro.cycles}
								onChange={handleChangePomodoro}
								placeholder="Inserisci il numero di cicli"
								className="input-field"
								required
							/>
							<Form.Label>Cicli completati</Form.Label>
							<Form.Control
								type="number"
								name="cyclesCompleted"
								value={form.pomodoro.cyclesCompleted}
								onChange={handleChangePomodoro}
								placeholder="Inserisci il numero di cicli completati"
								className="input-field"
								required
							/>
							<Form.Label>Durata studio</Form.Label>
							<Form.Control
								type="number"
								name="studyDuration"
								value={form.pomodoro.studyDuration}
								onChange={handleChangePomodoro}
								placeholder="Inserisci la durata dello studio"
								className="input-field"
								required
							/>
							<Form.Label>Durata pausa</Form.Label>
							<Form.Control
								type="number"
								name="breakDuration"
								value={form.pomodoro.breakDuration}
								onChange={handleChangePomodoro}
								placeholder="Inserisci la durata della pausa"
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
							Modifica Sessione
						</Button>
					</Modal.Footer>
				</Form>
			</Modal>
		</>
	);
}
