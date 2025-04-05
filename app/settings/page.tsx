"use client";

import { useEffect, useState } from "react";
import { GlobalSideBar } from "../components/GlobalSideBar";
import { useUser } from "../components/UserContext";
import ProfilePictureUpload from "./components/ProfilePictureUpload";
import SettingsForm from "./components/SettingsForm";

export default function SettingsPage() {
	const { user, updateUser, fetchUser } = useUser();

	const [formData, setFormData] = useState({
		username: "",
		firstName: "",
		lastName: "",
		email: "",
		birthDay: "",
		oldPassword: "",
		newPassword: "",
		previews: {
			calendar: {
				activity: true,
				event: true,
				session: true,
				projectActivity: true,
				maxOccurrences: 10
			},
			maxChats: 10,
			maxNotes: 10
		},
		alarmPreferences: {
			email: true,
			push: true
		}
	});

	// Password fields
	const [showPasswordFields, setShowPasswordFields] = useState(false);

	// Response messages
	const [errorMessage, setErrorMessage] = useState("");
	const [successMessage, setSuccessMessage] = useState("");

	useEffect(() => {
		const loadUserData = async () => {
			if (user) {
				setFormData((prev) => ({
					...prev, // Mantieni le modifiche esistenti
					username: user.username || "",
					firstName: user.firstName || "",
					lastName: user.lastName || "",
					email: user.email || "",
					birthDay: user.birthDay?.split("T")[0] || "",
					oldPassword: "",
					newPassword: "",
					previews: user.previews,
					alarmPreferences: user.alarmPreferences
				}));
			}
		};
		loadUserData();
	}, [user]);

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
			const body = {
				username: formData.username,
				firstName: formData.firstName,
				lastName: formData.lastName,
				email: formData.email,
				birthDay: formData.birthDay,
				oldPassword: showPasswordFields ? formData.oldPassword : "",
				password: showPasswordFields ? formData.newPassword : "",
				previews: formData.previews,
				alarmPreferences: formData.alarmPreferences
			};

			const response = await fetch("/api/user/modify", {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(body)
			});

			const data = await response.json();
			if (response.ok) {
				updateUser({
					...user!,
					...formData,
					birthDay: formData.birthDay
				});
				setSuccessMessage("Profilo aggiornato con successo");
			} else {
				setErrorMessage(data.message || "Errore di aggiornamento");
				alert(data.message || "Errore di aggiornamento");
			}
		} catch (error) {
			setErrorMessage("Errore di connessione");
		}
	};

	return (
		<div className="d-flex flex-column min-vh-100">
			<GlobalSideBar />
			<div className="container flex-grow-1 d-flex flex-column justify-content-center mt-3">
				<ProfilePictureUpload
					userId={user?._id}
					fetchUser={fetchUser}
				/>

				<SettingsForm
					formData={formData}
					setFormData={setFormData}
					showPasswordFields={showPasswordFields}
					setShowPasswordFields={setShowPasswordFields}
					onSubmit={handleSubmit}
					errorMessage={errorMessage}
					successMessage={successMessage}
				/>
			</div>
		</div>
	);
}
