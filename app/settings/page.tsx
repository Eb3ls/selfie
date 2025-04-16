"use client";

import { safeFetch } from "@/utils/fetch/fetch";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
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

		if (!formData.email.includes("@")) {
			toast.error("Email non valida");
			return;
		}

		if (
			showPasswordFields &&
			(!formData.oldPassword || !formData.newPassword)
		) {
			toast.error("Compila tutti i campi della password");
			return;
		}

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

		const response = await safeFetch(
			fetch("/api/user/modify", {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(body)
			})
		);

		if (response.ok) {
			updateUser({
				...user!,
				...formData,
				birthDay: formData.birthDay
			});
			toast.success("Modifiche salvate con successo");
		} else {
			toast.error("Errore durante il salvataggio delle modifiche");
		}
	};

	return (
		<div className="d-flex flex-column overflow-y-auto dvh-100 bg-light">
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
				/>
			</div>
		</div>
	);
}
