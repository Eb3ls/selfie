"use client";

import React, { useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { FaShareNodes } from "react-icons/fa6";

interface ShareModalInterface {
	studyTime: number;
	sessions: number;
	breakTime: number;
	children: any;
}

export function ShareModal({
	studyTime,
	sessions,
	breakTime,
	children
}: ShareModalInterface) {
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
						<FaShareNodes size={30} className="mx-2" />
						Condividi il Pomodoro
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
						<div className="d-flex justify-content-between">
							<div className="d-flex flex-column  align-items-center">
								<p>studyTime</p>
								<p>{studyTime}</p>
							</div>
							<div className="d-flex flex-column  align-items-center">
								<p>sessions</p>
								<p>{sessions}</p>
							</div>
							<div className="d-flex flex-column  align-items-center">
								<p>breakTime</p>
								<p>{breakTime}</p>
							</div>
						</div>
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
							Condividi
						</Button>
					</Modal.Footer>
				</Form>
			</Modal>
		</>
	);
}
