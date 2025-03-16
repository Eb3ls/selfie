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
	Spinner,
	Stack
} from "react-bootstrap";
import { FaImage, FaKey, FaSave, FaTimes, FaUserEdit } from "react-icons/fa";
import { GlobalSideBar } from "../components/GlobalSideBar";
import { useUser } from "../components/UserContext";
import styles from "./SettingsPage.module.css";

export default function SettingsPage() {
	const { user, updateUser } = useUser();
	const router = useRouter();

	const [formData, setFormData] = useState({
		username: "",
		firstName: "",
		lastName: "",
		email: "",
		birthDay: "",
		oldPassword: "",
		newPassword: ""
	});

	const [profilePic, setProfilePic] = useState<string | null>(null);
	const [isUploading, setIsUploading] = useState(false);
	const [profilePicError, setProfilePicError] = useState("");
	const [showPasswordFields, setShowPasswordFields] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");
	const [successMessage, setSuccessMessage] = useState("");

	useEffect(() => {
		const loadUserData = async () => {
			if (user) {
				setFormData({
					username: user.username || "",
					firstName: user.firstName || "",
					lastName: user.lastName || "",
					email: user.email || "",
					birthDay: user.birthDay?.split("T")[0] || "",
					oldPassword: "",
					newPassword: ""
				});

				try {
					const response = await fetch("/api/user/getProfilePic");
					if (response.ok) {
						const data = await response.json();
						setProfilePic(data.profilePic);
					}
				} catch (error) {
					console.error("Error fetching profile picture:", error);
				}
			}
		};
		loadUserData();
	}, [user]);

	const handleImageUpload = async (
		e: React.ChangeEvent<HTMLInputElement>
	) => {
		const file = e.target.files?.[0];
		if (!file) return;

		setProfilePicError("");
		setIsUploading(true);

		try {
			const formData = new FormData();
			formData.append("profilePic", file);

			const response = await fetch("/api/user/setProfilePic", {
				method: "POST",
				body: formData
			});

			const data = await response.json();
			if (!response.ok) throw new Error(data.message || "Upload error");

			setProfilePic(data.profilePic);
			updateUser({ ...user!, profilePic: data.profilePic });
		} catch (error) {
			setProfilePicError(
				error instanceof Error ? error.message : "Connection error"
			);
		} finally {
			setIsUploading(false);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setErrorMessage("");
		setSuccessMessage("");

		if (!formData.email.includes("@")) {
			setErrorMessage("Invalid email");
			return;
		}

		if (
			showPasswordFields &&
			(!formData.oldPassword || !formData.newPassword)
		) {
			setErrorMessage("Insert both current and new password");
			return;
		}

		try {
			const response = await fetch("/api/user/modify", {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
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
				updateUser({
					...user!,
					...formData,
					birthDay: formData.birthDay
				});
				setSuccessMessage("Profile updated successfully!");
			} else {
				setErrorMessage(data.message || "Update error");
			}
		} catch (error) {
			setErrorMessage("Connection error");
		}
	};

	return (
		<main>
			<GlobalSideBar />
			<Container fluid className={styles.container}>
				<Row className="justify-content-center">
					<Col xl={10} lg={12}>
						<Card className={styles.profileCard}>
							<Card.Header className={styles.cardHeader}>
								<h1>
									<FaUserEdit className={styles.titleIcon} />
									Impostazioni
								</h1>
							</Card.Header>

							<Card.Body className={styles.cardBody}>
								<Row className="g-4">
									{/* Profile Picture Section */}
									<Col
										md={5}
										className={styles.profileSection}
									>
										<div
											className={styles.profilePicWrapper}
										>
											<div
												className={
													styles.profilePicContainer
												}
											>
												<img
													src={
														profilePic ||
														"/defaults/default-profile.png"
													}
													alt="Profile"
													className={
														styles.profilePic
													}
													onError={(e) =>
														((
															e.target as HTMLImageElement
														).src =
															"/defaults/default-profile.png")
													}
												/>
												{isUploading && (
													<div
														className={
															styles.uploadOverlay
														}
													>
														<Spinner
															animation="border"
															variant="light"
														/>
													</div>
												)}
											</div>

											<input
												type="file"
												id="profilePicInput"
												accept="image/*"
												onChange={handleImageUpload}
												hidden
											/>
											<Button
												variant="outline-primary"
												className={styles.uploadButton}
												onClick={() =>
													document
														.getElementById(
															"profilePicInput"
														)
														?.click()
												}
												disabled={isUploading}
											>
												<FaImage
													className={
														styles.buttonIcon
													}
												/>
												{isUploading
													? "Caricando..."
													: " Cambia immagine"}
											</Button>

											{profilePicError && (
												<div
													className={
														styles.errorMessage
													}
												>
													{profilePicError}
												</div>
											)}
										</div>
									</Col>

									{/* Settings Form */}
									<Col md={7}>
										<Form
											onSubmit={handleSubmit}
											className={styles.settingsForm}
										>
											<Stack gap={3}>
												<Form.Group controlId="username">
													<Form.Label>
														Username
													</Form.Label>
													<Form.Control
														value={
															formData.username
														}
														onChange={(e) =>
															setFormData({
																...formData,
																username:
																	e.target
																		.value
															})
														}
														required
													/>
												</Form.Group>

												<Row>
													<Col md={6}>
														<Form.Group controlId="firstName">
															<Form.Label>
																Nome
															</Form.Label>
															<Form.Control
																value={
																	formData.firstName
																}
																onChange={(e) =>
																	setFormData(
																		{
																			...formData,
																			firstName:
																				e
																					.target
																					.value
																		}
																	)
																}
															/>
														</Form.Group>
													</Col>
													<Col md={6}>
														<Form.Group controlId="lastName">
															<Form.Label>
																Cognome
															</Form.Label>
															<Form.Control
																value={
																	formData.lastName
																}
																onChange={(e) =>
																	setFormData(
																		{
																			...formData,
																			lastName:
																				e
																					.target
																					.value
																		}
																	)
																}
															/>
														</Form.Group>
													</Col>
												</Row>

												<Form.Group controlId="email">
													<Form.Label>
														Email
													</Form.Label>
													<Form.Control
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

												<Form.Group controlId="birthDay">
													<Form.Label>
														Data di nascita
													</Form.Label>
													<Form.Control
														type="date"
														value={
															formData.birthDay
														}
														onChange={(e) =>
															setFormData({
																...formData,
																birthDay:
																	e.target
																		.value
															})
														}
													/>
												</Form.Group>

												<div
													className={
														styles.passwordSection
													}
												>
													<Button
														className={`${styles.passwordToggle} ${showPasswordFields ? styles.active : ""}`}
														onClick={() =>
															setShowPasswordFields(
																!showPasswordFields
															)
														}
													>
														<FaKey
															className={
																styles.buttonIcon
															}
														/>
														{showPasswordFields
															? " Nascondi cambia password"
															: " Cambia password"}
													</Button>

													{showPasswordFields && (
														<Stack
															gap={3}
															className="mt-3"
														>
															<Form.Group controlId="oldPassword">
																<Form.Label>
																	Current
																	Password
																</Form.Label>
																<Form.Control
																	type="password"
																	value={
																		formData.oldPassword
																	}
																	onChange={(
																		e
																	) =>
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
															<Form.Group controlId="newPassword">
																<Form.Label>
																	New Password
																</Form.Label>
																<Form.Control
																	type="password"
																	value={
																		formData.newPassword
																	}
																	onChange={(
																		e
																	) =>
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

												{(errorMessage ||
													successMessage) && (
													<div
														className={
															errorMessage
																? styles.errorMessage
																: styles.successMessage
														}
													>
														{errorMessage ||
															successMessage}
													</div>
												)}

												<div
													className={
														styles.buttonGroup
													}
												>
													<Button
														type="submit"
														variant="primary"
														className={
															styles.primaryButton
														}
													>
														<FaSave
															className={
																styles.buttonIcon
															}
														/>{" "}
														Salva
													</Button>
												</div>
											</Stack>
										</Form>
									</Col>
								</Row>
							</Card.Body>
						</Card>
					</Col>
				</Row>
			</Container>
		</main>
	);
}
