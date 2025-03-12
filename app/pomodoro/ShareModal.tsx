"use client";

import React, { useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { IoShareSocial } from "react-icons/io5";

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
			<span
				onClick={() => setShow(true)}
				style={{ cursor: "pointer", zIndex: 1 }}
			>
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
					<Modal.Title className="d-flex align-items-center">
						<IoShareSocial size={30} className="me-2" />
						<span>Condividi il Pomodoro</span>
					</Modal.Title>
				</Modal.Header>
				<Form onSubmit={handleSubmit} className="custom-form">
					<Modal.Body>
						<div className="pomodoro-details p-3 bg-light rounded mb-4">
							<div className="d-flex justify-content-between">
								<div className="text-center">
									<small className="text-muted">Studio</small>
									<p className="mb-0 fw-bold">
										{studyTime} min
									</p>
								</div>
								<div className="text-center">
									<small className="text-muted">
										Sessioni
									</small>
									<p className="mb-0 fw-bold">{sessions}</p>
								</div>
								<div className="text-center">
									<small className="text-muted">Pausa</small>
									<p className="mb-0 fw-bold">
										{breakTime} min
									</p>
								</div>
							</div>
						</div>
						<Form.Group className="mb-3" controlId="formFirstName">
							<Form.Label>Nome utente</Form.Label>
							<Form.Control
								type="text"
								name="username"
								value={form.username}
								onChange={handleChange}
								placeholder="Inserisci il tuo nome"
								className="input-field"
								required
								minLength={2}
								autoFocus
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
							disabled={!form.username.trim()}
						>
							Condividi
						</Button>
					</Modal.Footer>
				</Form>
			</Modal>
		</>
	);
}
