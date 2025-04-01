"use client";

import { AlarmSelector } from "@/app/calendar/AlarmSelector";
import { InvitationComponent } from "@/app/calendar/InvitationComponent";
import "@/app/calendar/Modal.css";
import { TimezoneSelector } from "@/app/calendar/TimezoneSelector";
import StandardInput from "@/app/components/StandardInput";
import StandardModal from "@/app/components/StandardModal";
import { useTime } from "@/app/components/TimeContext";
import { StringAlarm } from "@/utils/db/db";
import React, { useState } from "react";

export function AddActivityModal({ children }: any) {
	const [show, setShow] = useState(false);
	const [form, setForm] = useState({
		summary: "",
		description: "",
		due: "",
		categories: "",
		location: "",
		geo: "",
		parentActivityId: "",
		usernameList: [] as string[],
		alarms: [] as StringAlarm[]
	});
	const { dateTime } = useTime();

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const { name, value } = e.target;
		setForm({
			...form,
			[name]: value
		});
	};

	// Gestisce il submit del form
	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		// Converti la data di consegna in formato ISO
		form.due = new Date(form.due).toISOString();

		// Imposta la data di inizio (dtStart) come la data di creazione (dtStamp)
		const dtStart = dateTime.toISOString();

		// TODO: Implementare la selezione delle attività genitore
		form.parentActivityId = null as any;

		console.log("Form inviato:", { ...form, dtStart });

		const response = await fetch("/api/calendar/activity/add", {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({ ...form, dtStart, status: "NEEDS-ACTION" }) // Includi dtStart e lo stato di default
		});

		if (response.status === 200) {
			alert("Successful!");
			window.location.reload();
		} else if (response.status === 400) {
			const out = await response.json();
			if (out.message === undefined) {
				alert("Failed! User not found: " + out.users[0]);
			} else {
				alert("Failed! " + out.message);
			}
		} else {
			alert("Failed! Status code: " + response.status);
		}
	};

	const handleAlarmsChange = (newAlarms: StringAlarm[]) => {
		setForm({
			...form,
			alarms: newAlarms
		});
	};

	const handleTimezoneChange = (timezone: string) => {
		setForm({
			...form,
			geo: timezone
		});
	};

	const handleUsernameListChange = (newUsernameList: string[]) => {
		setForm({
			...form,
			usernameList: newUsernameList
		});
	};

	return (
		<>
			{/* Bottone per aprire il modal */}
			<span onClick={() => setShow(true)} style={{ cursor: "pointer" }}>
				{children}
			</span>

			<StandardModal
				title="Nuova Attività"
				saveBtnText="Crea"
				show={show}
				handleClose={() => setShow(false)}
				handleSubmit={handleSubmit}
			>
				<StandardInput
					type="text"
					name="summary"
					title="Titolo"
					placeholder="Inserisci titolo"
					onChange={handleChange}
					value={form.summary}
				/>

				<StandardInput
					type="textarea"
					name="description"
					title="Descrizione"
					placeholder="Inserisci descrizione"
					onChange={handleChange}
					value={form.description}
					isRequired={false}
				/>

				<StandardInput
					type="datetime-local"
					name="due"
					title="Consegna"
					onChange={handleChange}
					value={form.due}
				/>

				<StandardInput
					type="text"
					name="categories"
					title="Categorie (separate da virgola)"
					value={form.categories}
					onChange={handleChange}
					placeholder="Inserisci categorie"
				/>

				<TimezoneSelector
					regularTimezone={form.geo}
					setRegularTimezone={handleTimezoneChange}
					firstDateToConvert={{
						text: "Consegna",
						date: form.due
					}}
					secondDateToConvert={undefined}
				/>

				<InvitationComponent
					mainId={"42"}
					usernameList={form.usernameList}
					setUsernameList={handleUsernameListChange}
				/>

				<AlarmSelector
					alarms={form.alarms}
					onChange={handleAlarmsChange}
				/>
			</StandardModal>
		</>
	);
}
