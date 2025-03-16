"use client";

import { onSubmit } from "@/app/components/components_utils/components_functions";
import React from "react";

export function LoginForm() {
	return (
		<form onSubmit={(event) => onSubmit(event, "signin")}>
			<input type="text" placeholder="Username" name="username" />
			<input type="text" placeholder="Password" name="password" />
			<button type="submit">Premi qui</button>
		</form>
	);
}
