"use client";

import { Button, Form, Stack } from "react-bootstrap";
import { FaKey } from "react-icons/fa";
import styles from "../SettingsPage.module.css";

export default function PasswordSection({
	showPasswordFields,
	setShowPasswordFields,
	formData,
	setFormData
}: {
	showPasswordFields: boolean;
	setShowPasswordFields: React.Dispatch<React.SetStateAction<boolean>>;
	formData: any;
	setFormData: React.Dispatch<React.SetStateAction<any>>;
}) {
	return (
		<div className={styles.passwordSection}>
			<Button
				className={`${styles.passwordToggle} ${
					showPasswordFields ? styles.active : ""
				}`}
				onClick={() => setShowPasswordFields(!showPasswordFields)}
			>
				<FaKey className={styles.buttonIcon} />
				{showPasswordFields
					? " Nascondi cambia password"
					: " Cambia password"}
			</Button>

			{showPasswordFields && (
				<Stack gap={3} className="mt-3">
					<Form.Group controlId="oldPassword">
						<Form.Label>Password attuale</Form.Label>
						<Form.Control
							type="password"
							value={formData.oldPassword}
							onChange={(e) =>
								setFormData({
									...formData,
									oldPassword: e.target.value
								})
							}
							placeholder="Inserisci la password corrente"
						/>
					</Form.Group>

					<Form.Group controlId="newPassword">
						<Form.Label>Nuova password</Form.Label>
						<Form.Control
							type="password"
							value={formData.newPassword}
							onChange={(e) =>
								setFormData({
									...formData,
									newPassword: e.target.value
								})
							}
							placeholder="Inserisci la nuova password"
						/>
					</Form.Group>
				</Stack>
			)}
		</div>
	);
}
