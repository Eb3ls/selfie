"use client";

import React, { useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import "./GenericModal.css";

// Componente per il modal generico
// Questo componente prende in input un figlio (children) che sarà il bottone per aprire il modal
// Uso canonico:
// <GenericModal>
//               <Button>Prova</Button>
// </GenericModal>

export function GenericModal({ children }: any) {
	const [show, setShow] = useState(false);
	const [formData, setFormData] = useState({
		firstName: "",
		lastName: "",
		email: "",
		password: "",
		confirmPassword: "",
		birthDate: ""
	});

	function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
		const { name, value } = event.target;
		setFormData({ ...formData, [name]: value });
	}

	function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (formData.password !== formData.confirmPassword) {
			alert("Le password non corrispondono!");
			return;
		}
		console.log("Dati del form:", formData);
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
			>
				<Modal.Header closeButton className="custom-modal-header">
					<Modal.Title>
						<i className="bi bi-person-plus"></i> Creazione Utente
					</Modal.Title>
				</Modal.Header>
				<Form onSubmit={handleSubmit} className="custom-form">
					<Modal.Body>
						<Form.Group className="mb-3" controlId="formFirstName">
							<Form.Label>Nome</Form.Label>
							<Form.Control
								type="text"
								name="firstName"
								value={formData.firstName}
								onChange={handleChange}
								placeholder="Inserisci nome"
								className="input-field"
								required
							/>
						</Form.Group>

						<Form.Group className="mb-3" controlId="formLastName">
							<Form.Label>Cognome</Form.Label>
							<Form.Control
								type="text"
								name="lastName"
								value={formData.lastName}
								onChange={handleChange}
								placeholder="Inserisci cognome"
								className="input-field"
								required
							/>
						</Form.Group>

						<Form.Group className="mb-3" controlId="formEmail">
							<Form.Label>Email</Form.Label>
							<Form.Control
								type="email"
								name="email"
								value={formData.email}
								onChange={handleChange}
								autoComplete="email"
								placeholder="Inserisci email"
								className="input-field"
								required
							/>
						</Form.Group>

						<Form.Group className="mb-3" controlId="formPassword">
							<Form.Label>Password</Form.Label>
							<Form.Control
								type="password"
								name="password"
								value={formData.password}
								onChange={handleChange}
								autoComplete="new-password"
								placeholder="Inserisci password"
								className="input-field"
								required
							/>
						</Form.Group>

						<Form.Group
							className="mb-3"
							controlId="formConfirmPassword"
						>
							<Form.Label>Conferma Password</Form.Label>
							<Form.Control
								type="password"
								name="confirmPassword"
								value={formData.confirmPassword}
								onChange={handleChange}
								autoComplete="new-password"
								placeholder="Conferma password"
								className="input-field"
								required
							/>
						</Form.Group>

						<Form.Group className="mb-3" controlId="formBirthDate">
							<Form.Label>Data di Nascita</Form.Label>
							<Form.Control
								type="date"
								name="birthDate"
								value={formData.birthDate}
								onChange={handleChange}
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
							Crea utente
						</Button>
					</Modal.Footer>
				</Form>
			</Modal>
		</>
	);
}
