"use client";
import React from "react";
import { useState } from "react";

const BasicLogin = () => {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");

	async function handleClick() {
		const response = await fetch("/api/signin", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				username: username,
				password: password,
			}),
		});
		// Check if the response is 200
		if (response.status === 200) {
			const data = await response.json();
			console.log(data.message);
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
			<input
				id="2"
				type="text"
				placeholder="Password"
				onChange={(event) => setPassword(event.target.value)}
			/>
			<button onClick={handleClick}>Premi qui</button>
		</div>
	);
};

export default BasicLogin;
