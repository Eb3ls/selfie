"use client";

import Image from "next/image";
import { useState } from "react";
import { Button, Spinner } from "react-bootstrap";
import { FaImage } from "react-icons/fa";
import { DEFAULT_PROFILE_PIC } from "../../constants";
import styles from "../SettingsPage.module.css";

export default function ProfilePictureUpload({
	profilePic,
	isUploading,
	profilePicError,
	onImageUpload
}: {
	profilePic: string | null;
	isUploading: boolean;
	profilePicError: string;
	onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
	const [errorLoadImage, setErrorLoadImage] = useState(false);

	return (
		<div className={styles.profilePicWrapper}>
			<div className={styles.profilePicContainer}>
				<Image
					src={
						errorLoadImage
							? DEFAULT_PROFILE_PIC
							: profilePic || DEFAULT_PROFILE_PIC
					}
					alt="Profile"
					width={500}
					height={500}
					className={styles.profilePic}
					onError={() => setErrorLoadImage(true)}
				/>
				{isUploading && (
					<div className={styles.uploadOverlay}>
						<Spinner animation="border" variant="light" />
					</div>
				)}
			</div>

			<input
				type="file"
				id="profilePicInput"
				accept="image/*"
				onChange={onImageUpload}
				hidden
			/>
			<Button
				variant="outline-primary"
				className={styles.uploadButton}
				onClick={() =>
					document.getElementById("profilePicInput")?.click()
				}
				disabled={isUploading}
			>
				<FaImage className={styles.buttonIcon} />
				{isUploading ? "Caricando..." : " Cambia immagine"}
			</Button>

			{profilePicError && (
				<div className={styles.errorMessage}>{profilePicError}</div>
			)}
		</div>
	);
}
