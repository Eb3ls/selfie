"use client";

import "@/app/calendar/Modal.css";
import React, { useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";

export function AddActivityModal({ children }: any) {
	const [show, setShow] = useState(false);
	const [form, setForm] = useState({
		summary: "",
		description: "",
		status: "",
		dtStart: "",
		due: "",
		categories: [],
		location: "",
		geo: "",
		parentActivityId: "",
		alarms: []
	});

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
		form.due = new Date(form.due).toISOString();

		// TODO: Implementare la selezione delle attività genitore
		form.parentActivityId = null as any;

		console.log("Form inviato:", { ...form });

		const response = await fetch("/api/calendar/activity/add", {
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
						<i className="bi bi-person-plus me-2" />
						Nuova Attività
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
								name="due"
								value={form.due}
								onChange={handleChange}
								placeholder="Inserisci data di fine"
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
							Crea Attività
						</Button>
					</Modal.Footer>
				</Form>
			</Modal>
		</>
	);
}
