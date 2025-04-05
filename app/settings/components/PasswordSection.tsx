"use client";

import { StandardInput } from "@/app/components/StandardInput";
import { Button } from "react-bootstrap";
import { FaKey } from "react-icons/fa";

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
		<div>
			<Button
				onClick={() => setShowPasswordFields(!showPasswordFields)}
				className="mb-3 w-100"
			>
				<FaKey />
				{showPasswordFields
					? " Nascondi cambia password"
					: " Cambia password"}
			</Button>

			{showPasswordFields && (
				<>
					<StandardInput
						type="password"
						name="oldPassword"
						title="Password attuale"
						value={formData.oldPassword}
						placeholder="Inserisci la password corrente"
						onChange={(e) =>
							setFormData({
								...formData,
								oldPassword: e.target.value
							})
						}
					/>
					<StandardInput
						type="password"
						name="newPassword"
						title="Nuova password"
						value={formData.newPassword}
						placeholder="Inserisci la nuova password"
						onChange={(e) =>
							setFormData({
								...formData,
								newPassword: e.target.value
							})
						}
					/>
				</>
			)}
		</div>
	);
}
