"use client";
import React from "react";
import { useState } from "react";

const BasicForm = () => {
	const [username, setUsername] = useState("");

	async function handleClick() {
		const response = await fetch("/api/signup", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				username: username,
				password: "password",
				firstName: "firstName",
				lastName: "lastName",
				email: "email",
			}),
		});
		// Check if the response is 200
		if (response.status === 200) {
			const data = await response.json();
			console.log(data.message);
			window.location.href = "/";
		} else {
			console.log("Error: " + response.status);
		}
	}

	return (
		<div>
			<input
				id="1"
				type="text"
				placeholder="Username"
				onChange={(event) => setUsername(event.target.value)}
			/>
			<button onClick={handleClick}>Premi qui</button>
		</div>
	);
};

export default BasicForm;
