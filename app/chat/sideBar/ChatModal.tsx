"use client";

import "@/app/chat/sideBar/Modal.css";
import React, { useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";

export function ChatModal({ children }: any) {
	const [show, setShow] = useState(false);
	const [form, setForm] = useState({
		username: ""
	});

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setForm({
			...form,
			[e.target.name]: e.target.value
		});
	};

	function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		console.log("Dati del form:", form);
		// Logica di gestione dei dati del form
		setShow(false);
	}

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
						Nuova chat
					</Modal.Title>
				</Modal.Header>
				<Form onSubmit={handleSubmit} className="custom-form">
					<Modal.Body>
						<Form.Group className="mb-3" controlId="formFirstName">
							<Form.Label>Nome dell`utente</Form.Label>
							<Form.Control
								type="text"
								name="username"
								value={form.username}
								onChange={handleChange}
								placeholder="Inserisci nome"
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
							Crea chat
						</Button>
					</Modal.Footer>
				</Form>
			</Modal>
		</>
	);
}
