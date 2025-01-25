"use client";

import React, { useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { FaPlus } from "react-icons/fa";
import "./GenericModal.css";

export function AddProjectModal({ children, handleAdd }: any) {
	const [show, setShow] = useState(false);
	const [formData, setFormData] = useState({
		summary: ""
	});

	function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
		const { name, value } = event.target;
		setFormData({ ...formData, [name]: value });
	}

	function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();

		// Validazione minima degli input
		if (!formData.summary) {
			alert("Entrambi i campi sono obbligatori.");
			return;
		}

		// Passa i dati al componente padre
		handleAdd(formData);

		// Resetta i dati del form dopo l'invio
		setFormData({
			summary: ""
		});

		// Chiude il modal
		setShow(false);
	}

	return (
		<>
			{/* Bottone per aprire il modal */}
			<span onClick={() => setShow(true)} style={{ cursor: "pointer" }}>
				{children || <FaPlus />}
			</span>

			<Modal
				show={show}
				onHide={() => setShow(false)}
				centered
				dialogClassName="custom-modal"
				backdropClassName="custom-backdrop"
			>
				<Modal.Header closeButton className="custom-modal-header">
					<Modal.Title>Aggiungi Progetto</Modal.Title>
				</Modal.Header>
				<Form onSubmit={handleSubmit} className="custom-form">
					<Modal.Body>
						<Form.Group className="mb-4" controlId="formTitle">
							<Form.Label>
								<strong>Titolo del progetto</strong>
							</Form.Label>
							<Form.Control
								type="text"
								name="summary"
								value={formData.summary}
								onChange={handleChange}
								placeholder="Inserisci il titolo del progetto"
								className="input-field"
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
							Aggiungi
						</Button>
					</Modal.Footer>
				</Form>
			</Modal>
		</>
	);
}
