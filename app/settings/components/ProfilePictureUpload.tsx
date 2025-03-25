"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Button, Spinner } from "react-bootstrap";
import { FaImage } from "react-icons/fa";
import { DEFAULT_PROFILE_URL } from "../../constants";
import styles from "../SettingsPage.module.css";

interface ProfilePictureUploadProps {
	userId: string | undefined;
	fetchUser: () => void;
}

export default function ProfilePictureUpload({
	userId,
	fetchUser
}: ProfilePictureUploadProps) {
	const [myPic, setMyPic] = useState<string | null>(null);

	// Image upload
	const [isUploading, setIsUploading] = useState(false);

	// Error messages
	const [fetchImageError, setFetchImageError] = useState(false);
	const [uploadImageError, setUploadImageError] = useState("");

	useEffect(() => {
		if (!userId) return;
		setMyPic(DEFAULT_PROFILE_URL + userId);
		setFetchImageError(false);
	}, [userId]);

	async function uploadImage(image: string) {
		const body = {
			base64Image: image
		};
		const response = await fetch("/api/user/setProfilePic", {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify(body)
		});

		setIsUploading(false);

		if (!response.ok) {
			setUploadImageError("Errore durante il caricamento dell'immagine.");
			return;
		}

		setFetchImageError(false);
		fetchUser();
	}

	function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
		const file = event.target.files?.[0];
		if (!file) return;

		setIsUploading(true);
		setUploadImageError("");

		const reader = new FileReader();
		reader.onload = () => {
			const result = reader.result as string;
			uploadImage(result);
		};
		reader.onerror = () => {
			setUploadImageError("Errore durante la lettura del file.");
			setIsUploading(false);
		};
		reader.readAsDataURL(file);

		event.target.value = "";
	}

	return (
		<div className={styles.profilePicWrapper}>
			<div className={styles.profilePicContainer}>
				<Image
					src={
						fetchImageError
							? DEFAULT_PROFILE_URL
							: myPic || DEFAULT_PROFILE_URL
					}
					alt="Profile"
					width={500}
					height={500}
					className={styles.profilePic}
					onError={() => setFetchImageError(true)}
					unoptimized
				/>
				{isUploading && (
					<div className={styles.uploadOverlay}>
						<Spinner animation="border" variant="light" />
					</div>
				)}
			</div>

			<input
				type="file"
				id="uploadInput"
				accept="image/*"
				onChange={handleImageUpload}
				hidden
			/>
			<Button
				variant="outline-primary"
				className={styles.uploadButton}
				disabled={isUploading}
				onClick={() => {
					document.getElementById("uploadInput")?.click();
				}}
			>
				<FaImage className={styles.buttonIcon} />
				{isUploading ? "Caricando..." : " Cambia immagine"}
			</Button>

			{uploadImageError && (
				<div className={styles.errorMessage}>{uploadImageError}</div>
			)}
		</div>
	);
}
