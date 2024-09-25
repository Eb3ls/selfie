"use client";

import React from "react";
import { FormEvent } from "react";

async function onSubmit(event: FormEvent<HTMLFormElement>) {
	event.preventDefault();

	// Rimossi provvisoriamente a fine di test
	// const formData = new FormData(event.currentTarget);
	// const data = Object.fromEntries(formData.entries());

	// Aggiunto a fini di test
	const data = {
		summary: "Test",
		description: "Test",
		status: 0,
		rrule: "Test",
		dtStart: new Date(),
		dtEnd: new Date(),
		dtStamp: new Date(),
		categories: [],
		location: "Test",
		geo: "Test",
		userList: [],
		alarms: []
	};

	const response = await fetch("/api/calendar/event/add", {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify(data)
	});
	if (response.status === 200) {
		const fetched_data = await response.json();
		alert("Successful: " + fetched_data._id);
		window.location.href = "/";
	} else {
		alert("Failed! Status code: " + response.status);
	}
}

export function CalendarForm() {
	return (
		<form onSubmit={onSubmit}>
			<input type="text" placeholder="Summary" name="summary" />
			<input type="text" placeholder="Description" name="description" />
			<input type="text" placeholder="Status" name="status" />
			<input type="text" placeholder="RRule" name="rrule" />
			<input type="text" placeholder="DTStart" name="dtStart" />
			<input type="text" placeholder="DTEnd" name="dtEnd" />
			<input type="text" placeholder="DTStamp" name="dtStamp" />
			<input type="text" placeholder="Categories" name="categories" />
			<input type="text" placeholder="Location" name="location" />
			<input type="text" placeholder="Geo" name="geo" />
			<input type="text" placeholder="UserList" name="userList" />
			<input type="text" placeholder="Alarms" name="alarms" />
			<button type="submit">Premi qui</button>
		</form>
	);
}
