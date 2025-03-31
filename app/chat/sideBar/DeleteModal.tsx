"use client";

import "@/app/chat/sideBar/Modal.css";
import React, { useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";

interface DeleteModalProps {
	chat_id: string;
	setSelectedChat: any;
	updateChatList: () => void;
	children: any;
}

export function DeleteModal({
	chat_id,
	setSelectedChat,
	updateChatList,
	children
}: DeleteModalProps) {
	const [show, setShow] = useState(false);

	// Gestisce il submit del form
	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		event.stopPropagation();

		setSelectedChat(null);

		const response = await fetch("/api/chat/delete", {
			method: "DELETE",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({ _id: chat_id })
		});

		if (!response.ok) {
			alert("Operazione fallita! Codice di stato: " + response.status);
			return;
		}

		alert("Chat eliminata con successo!");
		updateChatList();
	};

	const handleClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		setShow(true);
	};

	return (
		<>
			{/* Bottone per aprire il modal */}
			<span onClick={handleClick} style={{ cursor: "pointer" }}>
				{children}
			</span>

			<Modal
				show={show}
				onHide={() => setShow(false)}
				centered
				dialogClassName="custom-modal"
				backdropClassName="custom-backdrop"
				fullscreen="lg-down"
				onClick={(e: any) => e.stopPropagation()}
			>
				<Modal.Header closeButton className="custom-modal-header">
					<Modal.Title>
						<i className="bi bi-person-plus me-2" />
						Elimina Chat
					</Modal.Title>
				</Modal.Header>
				<Form onSubmit={handleSubmit} className="custom-form">
					<Modal.Body>
						<p>Sei sicuro di voler eliminare questa chat?</p>
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
							Cancella Chat
						</Button>
					</Modal.Footer>
				</Form>
			</Modal>
		</>
	);
}
