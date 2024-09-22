"use client";

import Image from "next/image";
import { useState } from "react";

// Colore rgb verde
const color = "rgb(64, 175, 12)";

export default function Login() {
	const [passwordVisible, setPasswordVisible] = useState(false);

	const togglePasswordVisibility = () => {
		setPasswordVisible(!passwordVisible);
		const passwordForm = document.getElementById(
			"passwordForm"
		) as HTMLInputElement;
		if (passwordForm) {
			passwordForm.type = passwordVisible ? "password" : "text";
		}
	};

	const emailForm = () => {
		return (
			<div className="mb-3 fs-5">
				<label htmlFor="email" className="form-label">
					Email address
				</label>
				<input
					type="email"
					id="emailForm"
					className="form-control"
					placeholder="name@example.com"
					required
				/>
			</div>
		);
	};

	const passwordForm = () => {
		return (
			<div className="mb-4 fs-5 form-group">
				<label htmlFor="passwordForm" className="form-label">
					Password
				</label>
				<div className="input-group">
					<input
						type={passwordVisible ? "text" : "password"}
						id="passwordForm"
						className="form-control"
						required
					/>
					<span
						className="input-group-text"
						onClick={togglePasswordVisibility}
						style={{ cursor: "pointer" }}
					>
						{passwordVisible ? (
							<i className="bi bi-eye-slash"></i>
						) : (
							<i className="bi bi-eye"></i>
						)}
					</span>
				</div>
			</div>
		);
	};

	return (
		<>
			<main>
				<div className="container-md container-fluid vh-100 vw-100 d-flex justify-content-center align-items-center">
					<div className="container">
						<div className="row">
							<div className="col-12 col-md-6 order-2 order-md-1 d-flex flex-column">
								<h1>Sign up</h1>
								{emailForm()}
								{passwordForm()}
								<button
									type="submit"
									className="btn rounded-5 mb-4 text-white"
									style={{ backgroundColor: color }}
								>
									Sign up
								</button>
								<p className="text-center">
									Already have an account?
									<a
										href="/login"
										className="ms-2 text-decoration-underline"
									>
										Sign in
									</a>
								</p>
							</div>
							<div className="col-12 col-md-6 order-1 order-md-2">
								<Image
									src="/Sloth.png"
									alt="Logo"
									width={500}
									height={500}
								/>
							</div>
						</div>
					</div>
				</div>
			</main>
		</>
	);
}
