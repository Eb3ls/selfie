"use client";

import { Col, Form, Row, Stack } from "react-bootstrap";
import Button from "react-bootstrap/Button";
import { FaSave } from "react-icons/fa";
import styles from "../SettingsPage.module.css";
import PasswordSection from "./PasswordSection";

export default function SettingsForm({
	formData,
	setFormData,
	showPasswordFields,
	setShowPasswordFields,
	onSubmit,
	errorMessage,
	successMessage
}: {
	formData: any;
	setFormData: React.Dispatch<React.SetStateAction<any>>;
	showPasswordFields: boolean;
	setShowPasswordFields: React.Dispatch<React.SetStateAction<boolean>>;
	onSubmit: (e: React.FormEvent) => void;
	errorMessage: string;
	successMessage: string;
}) {
	return (
		<Form onSubmit={onSubmit} className={styles.settingsForm}>
			<Stack gap={3}>
				{/* Username */}
				<h4>Impostazioni Utente</h4>
				<Form.Group controlId="username">
					<Form.Label>Username</Form.Label>
					<Form.Control
						value={formData.username}
						onChange={(e) =>
							setFormData({
								...formData,
								username: e.target.value
							})
						}
						required
					/>
				</Form.Group>

				{/* Nome e Cognome */}
				<Row>
					<Col md={6}>
						<Form.Group controlId="firstName">
							<Form.Label>Nome</Form.Label>
							<Form.Control
								value={formData.firstName}
								onChange={(e) =>
									setFormData({
										...formData,
										firstName: e.target.value
									})
								}
							/>
						</Form.Group>
					</Col>
					<Col md={6}>
						<Form.Group controlId="lastName">
							<Form.Label>Cognome</Form.Label>
							<Form.Control
								value={formData.lastName}
								onChange={(e) =>
									setFormData({
										...formData,
										lastName: e.target.value
									})
								}
							/>
						</Form.Group>
					</Col>
				</Row>

				{/* Email */}
				<Form.Group controlId="email">
					<Form.Label>Email</Form.Label>
					<Form.Control
						type="email"
						value={formData.email}
						onChange={(e) =>
							setFormData({ ...formData, email: e.target.value })
						}
						required
					/>
				</Form.Group>

				{/* Data di nascita */}
				<Form.Group controlId="birthDay">
					<Form.Label>Data di nascita</Form.Label>
					<Form.Control
						type="date"
						value={formData.birthDay}
						onChange={(e) =>
							setFormData({
								...formData,
								birthDay: e.target.value
							})
						}
					/>
				</Form.Group>

				{/* Sezione Password */}
				<PasswordSection
					showPasswordFields={showPasswordFields}
					setShowPasswordFields={setShowPasswordFields}
					formData={formData}
					setFormData={setFormData}
				/>

				<hr />

				{/* Sezione Anteprime */}
				<Form.Group controlId="previews">
					<Form.Label>
						<h4>Anteprime</h4>
					</Form.Label>
					<Stack gap={3}>
						{/* Impostazioni Calendario */}
						<div>
							<Form.Label>
								<h5>Impostazioni Calendario</h5>
							</Form.Label>
							<Row className="mb-3">
								<Col md={3}>
									<Form.Check
										type="checkbox"
										label="Attività"
										checked={
											formData.previews.calendar.activity
										}
										onChange={(e) =>
											setFormData((prev: any) => ({
												...prev,
												previews: {
													...prev.previews,
													calendar: {
														...prev.previews
															.calendar,
														activity:
															e.target.checked
													}
												}
											}))
										}
									/>
								</Col>
								<Col md={3}>
									<Form.Check
										type="checkbox"
										label="Evento"
										checked={
											formData.previews.calendar.event
										}
										onChange={(e) =>
											setFormData((prev: any) => ({
												...prev,
												previews: {
													...prev.previews,
													calendar: {
														...prev.previews
															.calendar,
														event: e.target.checked
													}
												}
											}))
										}
									/>
								</Col>
								<Col md={3}>
									<Form.Check
										type="checkbox"
										label="Sessione"
										checked={
											formData.previews.calendar.session
										}
										onChange={(e) =>
											setFormData((prev: any) => ({
												...prev,
												previews: {
													...prev.previews,
													calendar: {
														...prev.previews
															.calendar,
														session:
															e.target.checked
													}
												}
											}))
										}
									/>
								</Col>
								<Col md={3}>
									<Form.Check
										type="checkbox"
										label="Attività Progetto"
										checked={
											formData.previews.calendar
												.projectActivity
										}
										onChange={(e) =>
											setFormData((prev: any) => ({
												...prev,
												previews: {
													...prev.previews,
													calendar: {
														...prev.previews
															.calendar,
														projectActivity:
															e.target.checked
													}
												}
											}))
										}
									/>
								</Col>
							</Row>

							{/* Massimo Occorrenze */}
							<Form.Group controlId="maxOccurrences">
								<Form.Label>Massimo Occorrenze</Form.Label>
								<Form.Control
									type="number"
									min={0}
									value={
										formData.previews.calendar
											.maxOccurrences
									}
									onChange={(e) =>
										setFormData((prev: any) => ({
											...prev,
											previews: {
												...prev.previews,
												calendar: {
													...prev.previews.calendar,
													maxOccurrences:
														parseInt(
															e.target.value
														) || 0
												}
											}
										}))
									}
								/>
							</Form.Group>
						</div>

						<h5>Altre</h5>

						{/* Massimo Chat e Note */}
						<Row>
							<Col md={6}>
								<Form.Group controlId="maxChats">
									<Form.Label>Massimo Chat</Form.Label>
									<Form.Control
										type="number"
										min={0}
										value={formData.previews.maxChats}
										onChange={(e) =>
											setFormData((prev: any) => ({
												...prev,
												previews: {
													...prev.previews,
													maxChats:
														parseInt(
															e.target.value
														) || 0
												}
											}))
										}
									/>
								</Form.Group>
							</Col>
							<Col md={6}>
								<Form.Group controlId="maxNotes">
									<Form.Label>Massimo Note</Form.Label>
									<Form.Control
										type="number"
										min={0}
										value={formData.previews.maxNotes}
										onChange={(e) =>
											setFormData((prev: any) => ({
												...prev,
												previews: {
													...prev.previews,
													maxNotes:
														parseInt(
															e.target.value
														) || 0
												}
											}))
										}
									/>
								</Form.Group>
							</Col>
						</Row>
					</Stack>
				</Form.Group>

				{/* Messaggi di errore/successo */}
				{(errorMessage || successMessage) && (
					<div
						className={
							errorMessage
								? styles.errorMessage
								: styles.successMessage
						}
					>
						{errorMessage || successMessage}
					</div>
				)}

				{/* Pulsante Salva */}
				<div className={styles.buttonGroup}>
					<Button
						type="submit"
						variant="primary"
						className={styles.primaryButton}
					>
						<FaSave className={styles.buttonIcon} /> Salva
					</Button>
				</div>
			</Stack>
		</Form>
	);
}
