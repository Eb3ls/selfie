import { FormEvent } from "react";

export async function onSubmit(
	event: FormEvent<HTMLFormElement>,
	type: string
) {
	event.preventDefault();
	const formData = new FormData(event.currentTarget);
	const data = Object.fromEntries(formData.entries());

	const response = await fetch("/api/" + type, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(data),
	});
	if (response.status === 200) {
		const fetched_data = await response.json();
		alert("Successful: " + fetched_data.message);
		window.location.href = "/";
	} else {
		alert("Failed! Status code: " + response.status);
	}
}
