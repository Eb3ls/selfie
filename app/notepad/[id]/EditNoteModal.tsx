"use client";

// Assumendo che il modello Note sia in models
import React, { useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { FaEdit } from "react-icons/fa";
import "../GenericModal.css";

export function EditNoteModal({
	note,
	currentUserId,
	handleEdit,
	children
}: any) {
	const [show, setShow] = useState(false);
	const [formData, setFormData] = useState({
		summary: note.summary,
		categories: note.categories,
		access: note.access,
		invitedUser: "", // Per input di aggiunta nuovi utenti
		userIdList: note.userIdList || [] // Invited users
	});

	function handleChange(
		event: React.ChangeEvent<
			HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
		>
	) {
		const { name, value } = event.target;
		setFormData({ ...formData, [name]: value });
	}

	function handleAddUser() {
		if (formData.invitedUser) {
			setFormData({
				...formData,
				userIdList: [...formData.userIdList, formData.invitedUser],
				invitedUser: ""
			});
		}
	}

	function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();

		// Validazione minima degli input
		if (!formData.summary || !formData.categories) {
			alert("Titolo e Categorie sono obbligatori.");
			return;
		}

		// Aggiorna la nota con i nuovi dati
		handleEdit({
			summary: formData.summary,
			categories: formData.categories,
			access: formData.access,
			userIdList: formData.userIdList,
			dtModified: new Date()
		});

		// Chiude il modal
		setShow(false);
	}

	return (
		<>
			{/* Bottone per aprire il modal */}
			<span onClick={() => setShow(true)} style={{ cursor: "pointer" }}>
				{children || <FaEdit />}{" "}
				{/* Usa il children passato o l'icona di default */}
			</span>

			<Modal
				show={show}
				onHide={() => setShow(false)}
				centered
				dialogClassName="custom-modal"
				backdropClassName="custom-backdrop"
			>
				<Modal.Header closeButton className="custom-modal-header">
					<Modal.Title>Modifica Nota</Modal.Title>
				</Modal.Header>
				<Form onSubmit={handleSubmit} className="custom-form">
					<Modal.Body>
						<Form.Group className="mb-4" controlId="formSummary">
							<Form.Label>
								<strong>Titolo</strong>
							</Form.Label>
							<Form.Control
								type="text"
								name="summary"
								value={formData.summary}
								onChange={handleChange}
								placeholder="Modifica il riassunto della nota"
								className="input-field"
							/>
						</Form.Group>

						<Form.Group className="mb-4" controlId="formCategories">
							<Form.Label>
								<strong>Categorie</strong>
							</Form.Label>
							<Form.Control
								type="text"
								name="categories"
								value={formData.categories}
								onChange={handleChange}
								placeholder="Modifica le categorie separate da virgola"
								className="input-field"
							/>
						</Form.Group>

						{note.ownerId.toString() ===
							currentUserId.toString() && (
							<>
								<Form.Group
									className="mb-4"
									controlId="formAccess"
								>
									<Form.Label>
										<strong>Permessi</strong>
									</Form.Label>
									<Form.Select
										name="access"
										value={formData.access}
										onChange={handleChange}
									>
										<option value="PRIVATE">Privata</option>
										<option value="INVITED">
											A invito
										</option>
										<option value="PUBLIC">Pubblica</option>
									</Form.Select>
								</Form.Group>

								{formData.access === "INVITED" && (
									<div className="invited-section">
										<Form.Group
											className="mb-4"
											controlId="formInvitedUsers"
										>
											<Form.Label>
												<strong>Utenti invitati</strong>
											</Form.Label>
											<ul>
												{formData.userIdList.map(
													(userId: any) => (
														<li
															key={userId.toString()}
														>
															{userId.toString()}
														</li>
													)
												)}
											</ul>
											<Form.Control
												type="text"
												name="invitedUser"
												value={formData.invitedUser}
												onChange={handleChange}
												placeholder="Aggiungi un utente per username"
												className="input-field"
											/>
											<Button
												variant="secondary"
												onClick={handleAddUser}
												className="add-user-button mt-2"
											>
												Aggiungi Utente
											</Button>
										</Form.Group>
									</div>
								)}
							</>
						)}
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
							Salva modifiche
						</Button>
					</Modal.Footer>
				</Form>
			</Modal>
		</>
	);
}
