"use client";

import { greenColor } from "@/app/color_palette";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useState } from "react";
import { Button, Col, Container, Form, InputGroup, Row } from "react-bootstrap";
import { IoIosSend } from "react-icons/io";
import { toast } from "react-toastify";

function CompleteFormComponent() {
	const [passwordShown, setPasswordShown] = useState(false); // Stato per la visibilità della password
	const [formData, setFormData] = useState({
		username: "",
		firstName: "",
		lastName: "",
		email: "",
		emailToken: "",
		password: ""
	}); // Stato per i dati del form
	const router = useRouter();

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

	// Gestore per il campo emailToken
	const handleEmailTokenChange = (event: ChangeEvent<HTMLInputElement>) => {
		const { value } = event.target;
		setFormData((prevData) => ({
			...prevData,
			emailToken: value
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

	// Invia una mail di conferma
	const sendVerificationEmail = async () => {
		const response = await fetch("/api/verifyEmail", {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				email: formData.email
			})
		});

		if (!response.ok) {
			toast.error("Invio email fallito! Controlla l'email");
			return;
		}

		toast.success("Email di verifica inviata!");
	};

	// Gestisce il submit del form
	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		const response = await fetch("/api/signup", {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify(formData)
		});

		if (!response.ok) {
			toast.error("Registrazione fallita! Controlla i dati");
			return;
		}

		toast.success("Registrazione effettuata con successo!");
		router.push("/login");
	};

	return (
		<Form onSubmit={handleSubmit} className="w-100">
			<div className="row g-3">
				{/* Campo Username */}
				<div className="col-12">
					<Form.Group controlId="formBasicUsername">
						<Form.Label className="fw-semibold mb-2">
							<i className="bi bi-person me-2"></i>Nome utente
							<span
								className="ms-1"
								data-bs-toggle="tooltip"
								data-bs-placement="right"
								title="Se il nome utente inizia con '[RES]-' verrà creata una risorsa e non sarà possibile effettuare il login"
							>
								<i className="bi bi-info-circle"></i>
							</span>
						</Form.Label>
						<Form.Control
							type="text"
							placeholder="Inserisci il tuo nome utente"
							name="username"
							value={formData.username}
							onChange={handleUsernameChange}
							autoComplete="username"
							required
							className="py-2 shadow-sm rounded-3"
							style={{ transition: "all 0.2s ease" }}
						/>
					</Form.Group>
				</div>

				{/* Nome - ora occupa tutta la larghezza */}
				<div className="col-12">
					<Form.Group controlId="formBasicFirstName">
						<Form.Label className="fw-semibold mb-2">
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
							className="py-2 shadow-sm rounded-3"
							style={{ transition: "all 0.2s ease" }}
						/>
					</Form.Group>
				</div>

				{/* Cognome - ora occupa tutta la larghezza */}
				<div className="col-12">
					<Form.Group controlId="formBasicLastName">
						<Form.Label className="fw-semibold mb-2">
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
							className="py-2 shadow-sm rounded-3"
							style={{ transition: "all 0.2s ease" }}
						/>
					</Form.Group>
				</div>

				{/* Email e Token */}
				<div className="col-12">
					<Form.Group controlId="formBasicEmail">
						<Form.Label className="fw-semibold mb-2">
							<i className="bi bi-envelope me-2"></i>Email
						</Form.Label>
						<InputGroup>
							<Form.Control
								type="email"
								placeholder="Inserisci la tua email"
								name="email"
								value={formData.email}
								onChange={handleEmailChange}
								autoComplete="email"
								required
								className="py-2 shadow-sm"
								style={{
									transition: "all 0.2s ease",
									borderRadius: "12px 0 0 12px"
								}}
							/>
							<InputGroup.Text
								onClick={sendVerificationEmail}
								className="shadow-sm"
								style={{
									cursor: "pointer",
									transition: "all 0.2s ease",
									backgroundColor: "#fff",
									borderRadius: "0 12px 12px 0"
								}}
								onMouseOver={(e) => {
									e.currentTarget.style.backgroundColor =
										"#f8f9fa";
								}}
								onMouseOut={(e) => {
									e.currentTarget.style.backgroundColor =
										"#fff";
								}}
							>
								<IoIosSend />
							</InputGroup.Text>
						</InputGroup>
					</Form.Group>
				</div>
				<div className="col-12">
					<Form.Group controlId="formBasicEmailToken">
						<Form.Label className="fw-semibold mb-2">
							<i className="bi bi-shield-lock me-2"></i>Token
						</Form.Label>
						<Form.Control
							type="text"
							placeholder="Inserisci il token ricevuto"
							name="emailToken"
							value={formData.emailToken}
							onChange={handleEmailTokenChange}
							autoComplete="off"
							required
							className="py-2 shadow-sm rounded-3"
							style={{ transition: "all 0.2s ease" }}
						/>
					</Form.Group>
				</div>

				{/* Password */}
				<div className="col-12">
					<Form.Group controlId="formBasicPassword">
						<Form.Label className="fw-semibold mb-2">
							<i className="bi bi-lock me-2"></i>Password
						</Form.Label>
						<InputGroup>
							<Form.Control
								type={passwordShown ? "text" : "password"}
								placeholder="Inserisci la tua password"
								name="password"
								value={formData.password}
								onChange={handlePasswordChange}
								autoComplete="new-password"
								required
								className="py-2 shadow-sm"
								style={{
									transition: "all 0.2s ease",
									borderRadius: "12px 0 0 12px"
								}}
							/>
							<InputGroup.Text
								onClick={togglePasswordVisibility}
								className="shadow-sm"
								style={{
									cursor: "pointer",
									transition: "all 0.2s ease",
									borderRadius: "0 12px 12px 0"
								}}
							>
								{passwordShown ? (
									<i className="bi bi-eye-slash"></i>
								) : (
									<i className="bi bi-eye"></i>
								)}
							</InputGroup.Text>
						</InputGroup>
					</Form.Group>
				</div>
			</div>

			{/* Submit Button */}
			<Button
				variant="primary"
				type="submit"
				className="w-100 py-2 mt-4 mb-3 fw-semibold"
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
				Registrati
			</Button>
		</Form>
	);
}

export default function Register() {
	return (
		<main
			className="min-vh-100 d-flex align-items-center py-4"
			style={{ background: "#f8f9fa" }}
		>
			<Container fluid="xxl">
				{" "}
				{/* Cambiato a fluid="xxl" per più controllo */}
				<Row className="justify-content-center">
					<Col xs={11} lg={10} xxl={9}>
						<div
							className="bg-white p-3 p-md-4 rounded-4 shadow-lg"
							style={{ transition: "all 0.3s ease" }}
						>
							<Row className="align-items-center g-4">
								<Col
									xs={12}
									lg={7}
									className="order-2 order-lg-1 d-flex flex-column"
								>
									<h1 className="mb-4 fw-bold">
										Crea un account
									</h1>
									<CompleteFormComponent />
									<p className="text-center mb-0">
										Hai già un account?{" "}
										<Link
											href="/login"
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
											Accedi
										</Link>
									</p>
								</Col>
								<Col
									xs={12}
									lg={5}
									className="order-1 order-lg-2 text-center mb-4 mb-lg-0"
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
