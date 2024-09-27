"use client";

import { greenColor } from "@/app/color_palette";
import Image from "next/image";
import Link from "next/link";
import { ChangeEvent, FormEvent, useState } from "react";
import { Button, Col, Container, Form, InputGroup, Row } from "react-bootstrap";

function CompleteFormComponent() {
	const [passwordShown, setPasswordShown] = useState(false); // Stato per la visibilità della password
	const [formData, setFormData] = useState({
		username: "",
		firstName: "",
		lastName: "",
		email: "",
		password: ""
	}); // Stato per i dati del form

	// Gestore per il campo username
	const handleUsernameChange = (event: ChangeEvent<HTMLInputElement>) => {
		const { value } = event.target;
		setFormData((prevData) => ({
			...prevData,
			username: value
		}));
	};

	// Gestore per il campo firstName
	const handleFirstNameChange = (event: ChangeEvent<HTMLInputElement>) => {
		const { value } = event.target;
		setFormData((prevData) => ({
			...prevData,
			firstName: value
		}));
	};

	// Gestore per il campo lastName
	const handleLastNameChange = (event: ChangeEvent<HTMLInputElement>) => {
		const { value } = event.target;
		setFormData((prevData) => ({
			...prevData,
			lastName: value
		}));
	};

	// Gestore per il campo email
	const handleEmailChange = (event: ChangeEvent<HTMLInputElement>) => {
		const { value } = event.target;
		setFormData((prevData) => ({
			...prevData,
			email: value
		}));
	};

	// Gestore per il campo password
	const handlePasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
		const { value } = event.target;
		setFormData((prevData) => ({
			...prevData,
			password: value
		}));
	};

	// Inverte la visibilità della password
	const togglePasswordVisibility = () => {
		setPasswordShown(!passwordShown);
	};

	// Gestisce il submit del form
	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		console.log("Form inviato:", formData);

		const response = await fetch("/api/signup", {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify(formData)
		});

		if (response.status === 200) {
			const fetched_data = await response.json();
			alert("Successful: " + fetched_data.username);
			window.location.href = "/home";
		} else if (response.status === 400) {
			alert("Failed! Wrong username or password!");
		} else {
			alert("Failed! Status code: " + response.status);
		}
	};

	return (
		<Form onSubmit={handleSubmit}>
			{/* Campo Username */}
			<Form.Group className="mb-3 fs-5" controlId="formBasicUsername">
				<Form.Label>
					<i className="bi bi-person me-2"></i>Username
				</Form.Label>
				<Form.Control
					type="text"
					placeholder="Inserisci il tuo username"
					name="username"
					value={formData.username}
					onChange={handleUsernameChange}
					autoComplete="username"
					required
				/>
			</Form.Group>

			{/* Campo Nome */}
			<Form.Group className="mb-3 fs-5" controlId="formBasicFirstName">
				<Form.Label>
					<i className="bi bi-person me-2"></i>Nome
				</Form.Label>
				<Form.Control
					type="text"
					placeholder="Inserisci il tuo nome"
					name="firstName"
					value={formData.firstName}
					onChange={handleFirstNameChange}
					autoComplete="given-name"
					required
				/>
			</Form.Group>

			{/* Campo Cognome */}
			<Form.Group className="mb-3 fs-5" controlId="formBasicLastName">
				<Form.Label>
					<i className="bi bi-person me-2"></i>Cognome
				</Form.Label>
				<Form.Control
					type="text"
					placeholder="Inserisci il tuo cognome"
					name="lastName"
					value={formData.lastName}
					onChange={handleLastNameChange}
					autoComplete="family-name"
					required
				/>
			</Form.Group>

			{/* Campo Email */}
			<Form.Group className="mb-3 fs-5" controlId="formBasicEmail">
				<Form.Label>
					<i className="bi bi-envelope me-2"></i>Email
				</Form.Label>
				<Form.Control
					type="email"
					placeholder="Inserisci la tua email"
					name="email"
					value={formData.email}
					onChange={handleEmailChange}
					autoComplete="email"
					required
				/>
			</Form.Group>

			{/* Campo Password */}
			<Form.Group className="mb-3 fs-5" controlId="formBasicPassword">
				<Form.Label>
					<i className="bi bi-lock me-2"></i>Password
				</Form.Label>
				<InputGroup>
					<Form.Control
						type={passwordShown ? "text" : "password"}
						placeholder="Inserisci la tua password"
						name="password"
						value={formData.password}
						onChange={handlePasswordChange}
						autoComplete="current-password"
						required
					/>
					<InputGroup.Text
						onClick={togglePasswordVisibility}
						style={{ cursor: "pointer" }}
					>
						{passwordShown ? (
							<i className="bi bi-eye-slash"></i>
						) : (
							<i className="bi bi-eye"></i>
						)}
					</InputGroup.Text>
				</InputGroup>
			</Form.Group>

			{/* Bottone di invio */}
			<Button
				variant="primary"
				type="submit"
				className="btn rounded-5 mb-4 text-white"
				style={{ backgroundColor: greenColor }}
			>
				Sign in
			</Button>
		</Form>
	);
}

export default function Register() {
	return (
		<main>
			<Container className="vh-100 vw-100 d-flex justify-content-center align-items-center">
				<Container>
					<Row>
						<Col
							xs={12}
							md={6}
							className="order-2 order-md-1 d-flex flex-column"
						>
							<h1 className="mb-4">Sign up</h1>
							<CompleteFormComponent />
							<p className="text-center">
								Already have an account?
								<Link
									href="/login"
									className="ms-2 text-decoration-underline"
								>
									Sign in
								</Link>
							</p>
						</Col>
						<Col xs={12} md={6} className="order-1 order-md-2">
							<Image
								src="/Sloth.png"
								alt="Logo"
								width={500}
								height={500}
								priority={true}
								draggable={false}
							/>
						</Col>
					</Row>
				</Container>
			</Container>
		</main>
	);
}
