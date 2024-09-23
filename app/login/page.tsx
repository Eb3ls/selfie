"use client";

import { greenColor } from "@/app/color_palette";
import Image from "next/image";
import Link from "next/link";
import { ChangeEvent, FormEvent, useState } from "react";
import { Button, Col, Container, Form, InputGroup, Row } from "react-bootstrap";

function CompleteFormComponent() {
	const [passwordShown, setPasswordShown] = useState(false); // Stato per la visibilità della password
	const [formData, setFormData] = useState({
		email: "",
		password: ""
	}); // Stato per i dati del form

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
	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		console.log("Form inviato:", formData);
		// Puoi gestire ulteriori azioni qui, come inviare i dati ad un server
	};

	return (
		<Form onSubmit={handleSubmit}>
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

export default function Login() {
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
							<h1 className="mb-4">Sign in</h1>
							<CompleteFormComponent />
							<p className="text-center">
								Needs to create an account?
								<Link
									href="/register"
									className="ms-2 text-decoration-underline"
								>
									Sign up
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
