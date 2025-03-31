"use client";

import "@/app/chat/sideBar/Modal.css";
import React, { useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";

interface ChatModalProps {
	updateChatList: () => void;
	children: any;
}

export function ChatModal({ updateChatList, children }: ChatModalProps) {
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

	// Gestisce il submit del form
	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		const response = await fetch("/api/chat/add", {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({ receiver: form.username })
		});

		if (!response.ok) {
			alert("Operazione fallita! Codice di stato: " + response.status);
			return;
		}

		alert("Chat creata con successo!");
		setShow(false);
		setForm({ username: "" });
		updateChatList();
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
			>
				<Modal.Header closeButton className="custom-modal-header">
					<Modal.Title>
						<i className="bi bi-chat-dots-fill" />
						Nuova chat
					</Modal.Title>
				</Modal.Header>
				<Form onSubmit={handleSubmit} className="custom-form">
					<Modal.Body>
						<Form.Group className="mb-3" controlId="formFirstName">
							<Form.Label>Nome dell&apos;utente</Form.Label>
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
