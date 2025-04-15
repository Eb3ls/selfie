"use client";

import { greenColor } from "@/app/color_palette";
import { useUser } from "@/app/components/UserContext";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useState } from "react";
import { Button, Col, Container, Form, InputGroup, Row } from "react-bootstrap";
import { toast } from "react-toastify";

function CompleteFormComponent() {
	const [passwordShown, setPasswordShown] = useState(false); // Stato per la visibilità della password
	const [formData, setFormData] = useState({
		username: "",
		password: ""
	}); // Stato per i dati del form
	const router = useRouter();
	const { fetchUser } = useUser();

	// Gestore per il campo username
	const handleUsernameChange = (event: ChangeEvent<HTMLInputElement>) => {
		const { value } = event.target;
		setFormData((prevData) => ({
			...prevData,
			username: value
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

		const response = await fetch("/api/signin", {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify(formData)
		});

		if (!response.ok) {
			const errorMessage = await response.json();
			if (
				errorMessage.message &&
				errorMessage.message === "Cannot login as a resource"
			) {
				toast.error(
					"Non puoi accedere come risorsa! Contatta un amministratore"
				);
			} else {
				toast.error("Accesso fallito! Controlla le tue credenziali");
			}
			return;
		}

		toast.success("Accesso effettuato con successo!");
		router.push("/home");
		fetchUser();
	};

	return (
		<Form onSubmit={handleSubmit} className="w-100">
			{/* Campo Username */}
			<Form.Group className="mb-4" controlId="formBasicUsername">
				<Form.Label className="fw-semibold">
					<i className="bi bi-person me-2"></i>Nome utente
				</Form.Label>
				<Form.Control
					type="text"
					placeholder="Inserisci il tuo nome utente"
					name="username"
					value={formData.username}
					onChange={handleUsernameChange}
					autoComplete="username"
					required
					className="py-2 shadow-sm"
					style={{ transition: "all 0.2s ease" }}
				/>
			</Form.Group>

			{/* Campo Password */}
			<Form.Group className="mb-4" controlId="formBasicPassword">
				<Form.Label className="fw-semibold">
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
						className="py-2 shadow-sm"
						style={{ transition: "all 0.2s ease" }}
					/>
					<InputGroup.Text
						onClick={togglePasswordVisibility}
						style={{ cursor: "pointer" }}
						className="shadow-sm"
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
				className="w-100 py-2 mb-4 fw-semibold"
				style={{
					backgroundColor: greenColor,
					border: "none",
					borderRadius: "12px",
					transition: "all 0.3s ease"
				}}
				onMouseOver={(e) => {
					e.currentTarget.style.transform = "translateY(-2px)";
					e.currentTarget.style.boxShadow =
						"0 6px 20px rgba(0,0,0,0.1)";
					e.currentTarget.style.backgroundColor = `${greenColor}dd`;
				}}
				onMouseOut={(e) => {
					e.currentTarget.style.transform = "translateY(0)";
					e.currentTarget.style.boxShadow = "none";
					e.currentTarget.style.backgroundColor = greenColor;
				}}
			>
				Accedi
			</Button>
		</Form>
	);
}

export default function Login() {
	return (
		<main
			className="dvh-100 d-flex align-items-center py-5"
			style={{ background: "#f8f9fa" }}
		>
			<Container>
				<Row className="justify-content-center">
					<Col xs={11} lg={10} xl={9}>
						<div
							className="bg-white p-4 p-md-5 rounded-4 shadow-lg"
							style={{ transition: "all 0.3s ease" }}
						>
							<Row className="align-items-center">
								<Col
									xs={12}
									md={6}
									className="order-2 order-md-1 d-flex flex-column"
								>
									<h1 className="mb-4 fw-bold">
										Bentornato!
									</h1>
									<CompleteFormComponent />
									<p className="text-center mb-0">
										Vuoi creare un account?{" "}
										<Link
											href="/register"
											className="ms-1 text-decoration-none"
											style={{
												color: greenColor,
												transition: "all 0.2s ease"
											}}
											onMouseOver={(e) => {
												e.currentTarget.style.opacity =
													"0.8";
											}}
											onMouseOut={(e) => {
												e.currentTarget.style.opacity =
													"1";
											}}
										>
											Registrati
										</Link>
									</p>
								</Col>
								<Col
									xs={12}
									md={6}
									className="order-1 order-md-2 text-center mb-4 mb-md-0"
								>
									<Image
										src="/Sloth.png"
										alt="Logo"
										width={400}
										height={400}
										priority={true}
										draggable={false}
										className="img-fluid"
									/>
								</Col>
							</Row>
						</div>
					</Col>
				</Row>
			</Container>
		</main>
	);
}
