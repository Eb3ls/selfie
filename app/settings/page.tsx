"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
	Button,
	Card,
	Col,
	Container,
	Form,
	Row,
	Stack
} from "react-bootstrap";
import { FaKey, FaSave, FaTimes, FaUserEdit } from "react-icons/fa";
import { GlobalSideBar } from "../components/GlobalSideBar";
import { useUser } from "../components/UserContext";
import styles from "./SettingsPage.module.css";

export default function SettingsPage() {
	const { user, updateUser } = useUser(); // Usa il contesto utente
	const router = useRouter();

	// Stati del form
	const [formData, setFormData] = useState({
		username: "",
		firstName: "",
		lastName: "",
		email: "",
		birthDay: "",
		oldPassword: "",
		newPassword: ""
	});

	const [showPasswordFields, setShowPasswordFields] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");
	const [successMessage, setSuccessMessage] = useState("");

	// Carica i dati dell'utente nel form quando il componente viene montato
	useEffect(() => {
		if (user) {
			setFormData({
				username: user.username || "",
				firstName: user.firstName || "",
				lastName: user.lastName || "",
				email: user.email || "",
				birthDay: user.birthDay?.split("T")[0] || "", // Formatta la data
				oldPassword: "",
				newPassword: ""
			});
		}
	}, [user]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setErrorMessage("");
		setSuccessMessage("");

		// Validazione base
		if (!formData.email.includes("@")) {
			setErrorMessage("Email non valida");
			return;
		}

		// Validazione password se i campi sono visibili
		if (showPasswordFields) {
			if (!formData.oldPassword || !formData.newPassword) {
				setErrorMessage(
					"Inserisci sia la vecchia che la nuova password"
				);
				return;
			}
		}

		try {
			const response = await fetch("/api/user/modify", {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${localStorage.getItem("token")}`
				},
				body: JSON.stringify({
					username: formData.username,
					firstName: formData.firstName,
					lastName: formData.lastName,
					email: formData.email,
					birthDay: formData.birthDay,
					oldPassword: showPasswordFields
						? formData.oldPassword
						: undefined,
					password: showPasswordFields
						? formData.newPassword
						: undefined
				})
			});

			const data = await response.json();

			if (response.ok) {
				// Aggiorna lo stato dell'utente nel contesto
				updateUser({
					...user!, // Usa l'operatore di non-null assertion (!) perché sappiamo che user esiste
					username: formData.username,
					firstName: formData.firstName,
					lastName: formData.lastName,
					email: formData.email,
					birthDay: formData.birthDay
				});

				setSuccessMessage("Profilo aggiornato con successo!");
			} else {
				setErrorMessage(
					data.message || "Errore durante l'aggiornamento"
				);
			}
		} catch (error) {
			setErrorMessage("Errore di connessione");
		}
	};

	return (
		<main>
			<GlobalSideBar />
			<Container
				fluid
				className={`mt-3 px-3 overflow-hidden ${styles.container}`}
			>
				<Row className="gx-3 justify-content-center">
					<Col xs={12} lg={8}>
						<Card className={styles.mainCard}>
							<div className={styles.cardHeader}>
								<h2 className={styles.cardTitle}>
									<FaUserEdit className={styles.icon} />
									Impostazioni Profilo
								</h2>
							</div>
							<Card.Body className="p-4">
								<Stack gap={4}>
									<Form onSubmit={handleSubmit}>
										<Stack gap={3}>
											{/* Campo Username */}
											<Form.Group
												controlId="username"
												className={styles.formGroup}
											>
												<Form.Label
													className={styles.formLabel}
												>
													Username
												</Form.Label>
												<Form.Control
													className={
														styles.formControl
													}
													type="text"
													value={formData.username}
													onChange={(e) =>
														setFormData({
															...formData,
															username:
																e.target.value
														})
													}
													required
												/>
											</Form.Group>

											{/* Nome e Cognome */}
											<Row>
												<Col md={6}>
													<Form.Group
														controlId="firstName"
														className={
															styles.formGroup
														}
													>
														<Form.Label
															className={
																styles.formLabel
															}
														>
															Nome
														</Form.Label>
														<Form.Control
															className={
																styles.formControl
															}
															type="text"
															value={
																formData.firstName
															}
															onChange={(e) =>
																setFormData({
																	...formData,
																	firstName:
																		e.target
																			.value
																})
															}
														/>
													</Form.Group>
												</Col>
												<Col md={6}>
													<Form.Group
														controlId="lastName"
														className={
															styles.formGroup
														}
													>
														<Form.Label
															className={
																styles.formLabel
															}
														>
															Cognome
														</Form.Label>
														<Form.Control
															className={
																styles.formControl
															}
															type="text"
															value={
																formData.lastName
															}
															onChange={(e) =>
																setFormData({
																	...formData,
																	lastName:
																		e.target
																			.value
																})
															}
														/>
													</Form.Group>
												</Col>
											</Row>

											{/* Email */}
											<Form.Group
												controlId="email"
												className={styles.formGroup}
											>
												<Form.Label
													className={styles.formLabel}
												>
													Email
												</Form.Label>
												<Form.Control
													className={
														styles.formControl
													}
													type="email"
													value={formData.email}
													onChange={(e) =>
														setFormData({
															...formData,
															email: e.target
																.value
														})
													}
													required
												/>
											</Form.Group>

											{/* Data di nascita */}
											<Form.Group
												controlId="birthDay"
												className={styles.formGroup}
											>
												<Form.Label
													className={styles.formLabel}
												>
													Data di nascita
												</Form.Label>
												<Form.Control
													className={
														styles.formControl
													}
													type="date"
													value={formData.birthDay}
													onChange={(e) =>
														setFormData({
															...formData,
															birthDay:
																e.target.value
														})
													}
												/>
											</Form.Group>

											{/* Cambio password */}
											<div className="mt-4">
												<Button
													className={`${styles.passwordToggle} ${
														showPasswordFields
															? styles.passwordToggleActive
															: ""
													}`}
													onClick={() =>
														setShowPasswordFields(
															!showPasswordFields
														)
													}
												>
													<FaKey
														className={styles.icon}
													/>
													{showPasswordFields
														? " Nascondi"
														: " Cambia Password"}
												</Button>

												{showPasswordFields && (
													<Stack
														gap={3}
														className="mt-3"
													>
														<Form.Group
															controlId="oldPassword"
															className={
																styles.formGroup
															}
														>
															<Form.Label
																className={
																	styles.formLabel
																}
															>
																Password Attuale
															</Form.Label>
															<Form.Control
																className={
																	styles.formControl
																}
																type="password"
																value={
																	formData.oldPassword
																}
																onChange={(e) =>
																	setFormData(
																		{
																			...formData,
																			oldPassword:
																				e
																					.target
																					.value
																		}
																	)
																}
															/>
														</Form.Group>

														<Form.Group
															controlId="newPassword"
															className={
																styles.formGroup
															}
														>
															<Form.Label
																className={
																	styles.formLabel
																}
															>
																Nuova Password
															</Form.Label>
															<Form.Control
																className={
																	styles.formControl
																}
																type="password"
																value={
																	formData.newPassword
																}
																onChange={(e) =>
																	setFormData(
																		{
																			...formData,
																			newPassword:
																				e
																					.target
																					.value
																		}
																	)
																}
															/>
														</Form.Group>
													</Stack>
												)}
											</div>

											{/* Messaggi di feedback */}
											{errorMessage && (
												<div
													className={`${styles.alertMessage} ${styles.errorMessage}`}
												>
													{errorMessage}
												</div>
											)}
											{successMessage && (
												<div
													className={`${styles.alertMessage} ${styles.successMessage}`}
												>
													{successMessage}
												</div>
											)}

											{/* Pulsanti */}
											<div className={styles.buttonGroup}>
												<Button
													variant="outline-secondary"
													className={
														styles.secondaryButton
													}
													onClick={() =>
														router.push("/")
													}
												>
													<FaTimes
														className={styles.icon}
													/>
													Annulla
												</Button>
												<Button
													variant="primary"
													type="submit"
													className={
														styles.primaryButton
													}
												>
													<FaSave
														className={styles.icon}
													/>
													Salva Modifiche
												</Button>
											</div>
										</Stack>
									</Form>
								</Stack>
							</Card.Body>
						</Card>
					</Col>
				</Row>
			</Container>
		</main>
	);
}
