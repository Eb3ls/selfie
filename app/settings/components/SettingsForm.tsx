"use client";

import { StandardInput } from "@/app/components/StandardInput";
import { useTime } from "@/app/components/TimeContext";
import { Card, Col, Form, Row } from "react-bootstrap";
import Button from "react-bootstrap/Button";
import { FaSave } from "react-icons/fa";
import PasswordSection from "./PasswordSection";

export default function SettingsForm({
	formData,
	setFormData,
	showPasswordFields,
	setShowPasswordFields,
	onSubmit
}: {
	formData: any;
	setFormData: React.Dispatch<React.SetStateAction<any>>;
	showPasswordFields: boolean;
	setShowPasswordFields: React.Dispatch<React.SetStateAction<boolean>>;
	onSubmit: (e: React.FormEvent) => void;
}) {
	const { dateTime } = useTime();

	return (
		<Form onSubmit={onSubmit}>
			{/* Username */}
			<div className="bg-white rounded-4 p-3 mb-3 small-border">
				<h4 className="text-primary mb-4">Impostazioni Utente</h4>
				<Card.Body>
					<StandardInput
						type="text"
						name="username"
						title="Username"
						value={formData.username}
						placeholder="Inserisci il tuo username"
						onChange={(e) =>
							setFormData({
								...formData,
								username: e.target.value
							})
						}
					/>

					<Row>
						<Col md={6}>
							<StandardInput
								type="text"
								name="firstName"
								title="Nome"
								value={formData.firstName}
								placeholder="Inserisci il tuo nome"
								onChange={(e) =>
									setFormData({
										...formData,
										firstName: e.target.value
									})
								}
							/>
						</Col>
						<Col md={6}>
							<StandardInput
								type="text"
								name="lastName"
								title="Cognome"
								value={formData.lastName}
								placeholder="Inserisci il tuo cognome"
								onChange={(e) =>
									setFormData({
										...formData,
										lastName: e.target.value
									})
								}
							/>
						</Col>
					</Row>

					<StandardInput
						type="email"
						name="email"
						title="Email"
						value={formData.email}
						placeholder="Inserisci la tua email"
						onChange={(e) =>
							setFormData({ ...formData, email: e.target.value })
						}
					/>

					<StandardInput
						type="date"
						name="birthDay"
						title="Data di nascita"
						value={formData.birthDay}
						placeholder="Inserisci la tua data di nascita"
						onChange={(e) =>
							setFormData({
								...formData,
								birthDay: e.target.value
							})
						}
						max={new Date(dateTime).toISOString().split("T")[0]}
					/>

					<PasswordSection
						showPasswordFields={showPasswordFields}
						setShowPasswordFields={setShowPasswordFields}
						formData={formData}
						setFormData={setFormData}
					/>
				</Card.Body>
			</div>

			<div className="bg-white rounded-4 p-3 mb-3 small-border">
				<h4 className="text-primary mb-4">Anteprime</h4>
				<Card.Body>
					<Row className="mb-3 g-2">
						<Col xs={6} md={3}>
							<Form.Check
								type="checkbox"
								label="Attività"
								checked={formData.previews.calendar.activity}
								onChange={(e) =>
									setFormData((prev: any) => ({
										...prev,
										previews: {
											...prev.previews,
											calendar: {
												...prev.previews.calendar,
												activity: e.target.checked
											}
										}
									}))
								}
							/>
						</Col>
						<Col xs={6} md={3}>
							<Form.Check
								type="checkbox"
								label="Evento"
								checked={formData.previews.calendar.event}
								onChange={(e) =>
									setFormData((prev: any) => ({
										...prev,
										previews: {
											...prev.previews,
											calendar: {
												...prev.previews.calendar,
												event: e.target.checked
											}
										}
									}))
								}
							/>
						</Col>
						<Col xs={6} md={3}>
							<Form.Check
								type="checkbox"
								label="Sessione"
								checked={formData.previews.calendar.session}
								onChange={(e) =>
									setFormData((prev: any) => ({
										...prev,
										previews: {
											...prev.previews,
											calendar: {
												...prev.previews.calendar,
												session: e.target.checked
											}
										}
									}))
								}
							/>
						</Col>
						<Col xs={6} md={3}>
							<Form.Check
								type="checkbox"
								label="Attività Progetto"
								checked={
									formData.previews.calendar.projectActivity
								}
								onChange={(e) =>
									setFormData((prev: any) => ({
										...prev,
										previews: {
											...prev.previews,
											calendar: {
												...prev.previews.calendar,
												projectActivity:
													e.target.checked
											}
										}
									}))
								}
							/>
						</Col>
					</Row>
					<StandardInput
						type="number"
						name="maxOccurrences"
						title="Massime occorrenze del calendario da visualizzare"
						value={formData.previews.calendar.maxOccurrences}
						min={0}
						onChange={(e) =>
							setFormData({
								...formData,
								previews: {
									...formData.previews,
									calendar: {
										...formData.previews.calendar,
										maxOccurrences: e.target.value
									}
								}
							})
						}
					/>

					<StandardInput
						type="number"
						name="maxChats"
						title="Massime chat da visualizzare"
						value={formData.previews.maxChats}
						min={0}
						onChange={(e) =>
							setFormData({
								...formData,
								previews: {
									...formData.previews,
									maxChats: e.target.value
								}
							})
						}
					/>

					<StandardInput
						type="number"
						name="maxNotes"
						title="Massime note da visualizzare"
						value={formData.previews.maxNotes}
						min={0}
						onChange={(e) =>
							setFormData({
								...formData,
								previews: {
									...formData.previews,
									maxNotes: e.target.value
								}
							})
						}
					/>
				</Card.Body>
			</div>

			<div className="bg-white rounded-4 p-3 mb-3 small-border">
				<h4 className="text-primary mb-4">Notifiche</h4>
				<Card.Body>
					<div className="mb-2">
						<Form.Switch
							id="email-switch"
							label="Email"
							checked={formData.alarmPreferences.email}
							onChange={(e) =>
								setFormData((prev: any) => ({
									...prev,
									alarmPreferences: {
										...prev.alarmPreferences,
										email: e.target.checked
									}
								}))
							}
						/>
					</div>
					<div>
						<Form.Switch
							id="push-switch"
							label="Notifiche Push"
							checked={formData.alarmPreferences.push}
							onChange={(e) =>
								setFormData((prev: any) => ({
									...prev,
									alarmPreferences: {
										...prev.alarmPreferences,
										push: e.target.checked
									}
								}))
							}
						/>
					</div>
				</Card.Body>
			</div>

			<Button
				type="submit"
				variant="primary"
				className="my-4 w-100 d-flex justify-content-center align-items-center fs-3 rounded-4"
			>
				<FaSave className="me-2" /> Salva
			</Button>
		</Form>
	);
}
