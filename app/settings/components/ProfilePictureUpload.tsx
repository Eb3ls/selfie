"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Button, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import { DEFAULT_PROFILE_URL } from "../../constants";

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
			toast.error("Errore durante il caricamento dell'immagine");
			return;
		}

		setFetchImageError(false);
		fetchUser();
	}

	function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
		const file = event.target.files?.[0];
		if (!file) return;

		setIsUploading(true);

		const reader = new FileReader();
		reader.onload = () => {
			const result = reader.result as string;
			uploadImage(result);
		};
		reader.onerror = () => {
			toast.error("Errore durante la lettura del file");
			setIsUploading(false);
		};
		reader.readAsDataURL(file);

		event.target.value = "";
	}

	return (
		<div className="d-flex flex-column align-items-center">
			<div className="position-relative mb-4">
				<div
					style={{
						width: "200px",
						height: "200px",
						borderRadius: "50%",
						overflow: "hidden"
					}}
				>
					<Image
						src={
							fetchImageError
								? DEFAULT_PROFILE_URL
								: myPic || DEFAULT_PROFILE_URL
						}
						alt="Profile"
						width={200}
						height={200}
						className="object-fit-cover"
						onError={() => setFetchImageError(true)}
						unoptimized
					/>
					{isUploading && (
						<div className="position-absolute top-50 start-50 translate-middle">
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
					variant="primary"
					className="position-absolute bottom-0 end-0 rounded-circle p-2 shadow-sm"
					disabled={isUploading}
					onClick={() =>
						document.getElementById("uploadInput")?.click()
					}
					style={{ width: "40px", height: "40px" }}
				>
					<i className="bi bi-pencil"></i>
				</Button>
			</div>
		</div>
	);
}
