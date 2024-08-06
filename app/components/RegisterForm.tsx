"use client";
import React from "react";
import { onSubmit } from "@/app/components/components_utils/components_functions";

export function RegisterForm() {
	return (
		<form onSubmit={(event) => onSubmit(event, "signup")}>
			<input type="text" placeholder="Username" name="username" />
			<input type="text" placeholder="Password" name="password" />
			<input type="text" placeholder="First Name" name="firstName" />
			<input type="text" placeholder="Last Name" name="lastName" />
			<input type="text" placeholder="E-Mail" name="email" />
			<button type="submit">Premi qui</button>
		</form>
	);
}
