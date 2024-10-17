"use client";

import "@/app/chat/sideBar/Modal.css";
import React, { useState } from "react";
import { Button, Container, Form, ListGroup, Modal } from "react-bootstrap";

export function GroupChatModal({ children }: any) {
	const [show, setShow] = useState(false);
	const [groupName, setGroupName] = useState("");
	const [userName, setUserName] = useState("");
	const [users, setUsers] = useState<string[]>([]);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setGroupName(e.target.value);
	};

	const handleUserNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setUserName(e.target.value);
	};

	// Gestisce il submit del form
	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		console.log("Form inviato:", groupName, users);

		const response = await fetch("/api/chat/addGroup", {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({ summary: groupName, usernameList: users })
		});

		if (response.status === 200) {
			alert("Successful!");
			window.location.reload();
		} else if (response.status === 400) {
			const out = await response.json();
			if (out.message === undefined) {
				alert(
					"Failed! Users not found:" + users.map((user) => " " + user)
				);
			} else {
				alert("Failed! " + out.message);
			}
		} else {
			alert("Failed! Status code: " + response.status);
		}
	};

	const handleAddUser = () => {
		if (userName.trim() !== "" && !users.includes(userName)) {
			setUsers([...users, userName]);
			setUserName("");
		}
	};

	const handleRemoveUser = (name: string) => {
		setUsers(users.filter((user) => user !== name));
	};

	function userItem(user: string, index: number) {
		return (
			<ListGroup.Item
				key={index}
				className="d-flex justify-content-between align-items-center text-break"
			>
				{user}
				<Button
					variant="danger"
					size="sm"
					onClick={() => handleRemoveUser(user)}
				>
					X
				</Button>
			</ListGroup.Item>
		);
	}

	function userListForm() {
		return (
			<>
				<Form.Group className="mb-3 align-items-center">
					<Form.Label className="me-2">Aggiungi utente</Form.Label>
					<Container className="d-flex p-0">
						<Form.Control
							type="text"
							name="userName"
							value={userName}
							onChange={handleUserNameChange}
							placeholder="Inserisci nome utente"
							className="input-field me-2"
						/>
						<Button onClick={handleAddUser} variant="primary">
							Aggiungi
						</Button>
					</Container>
				</Form.Group>
				{users.length > 0 && (
					<>
						<Form.Label className="mb-2">
							Utenti aggiunti
						</Form.Label>
						<ListGroup
							className="mt-3 overflow-y-auto"
							style={{ maxHeight: "40vh" }}
						>
							{users.map((user, index) => userItem(user, index))}
						</ListGroup>
					</>
				)}
			</>
		);
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
						Nuovo gruppo
					</Modal.Title>
				</Modal.Header>
				<Form onSubmit={handleSubmit} className="custom-form">
					<Modal.Body>
						<Form.Group className="mb-3" controlId="formFirstName">
							<Form.Label>Nome del gruppo</Form.Label>
							<Form.Control
								type="text"
								name="groupName"
								value={groupName}
								onChange={handleChange}
								placeholder="Inserisci nome"
								className="input-field"
								required
							/>
						</Form.Group>
						{userListForm()}
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
							Crea gruppo
						</Button>
					</Modal.Footer>
				</Form>
			</Modal>
		</>
	);
}
