"use client";

import { AlarmSelector } from "@/app/calendar/AlarmSelector";
import { InvitationComponent } from "@/app/calendar/InvitationComponent";
import "@/app/calendar/Modal.css";
import { TimezoneSelector } from "@/app/calendar/TimezoneSelector";
import { StandardInput } from "@/app/components/StandardInput";
import { StandardModal } from "@/app/components/StandardModal";
import { StringActivity, StringAlarm } from "@/utils/db/db";
import moment from "moment";
import React, { useState } from "react";

type StringActivityFrontend = Omit<StringActivity, "userIdList"> & {
	usernameList: string[];
};

export function ModifyActivityModal({
	activity,
	show,
	setShow
}: {
	activity: StringActivityFrontend;
	show: boolean;
	setShow: (show: boolean) => void;
}) {
	const newActivity: StringActivityFrontend = { ...activity };
	const [form, setForm] = useState(newActivity);

	const handleChange = (
		e: React.ChangeEvent<
			HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
		>
	) => {
		setForm({
			...form,
			[e.target.name]: e.target.value
		});
	};

	// Gestisce il submit del form
	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		// Converti le date in formato ISO
		form.due = new Date(form.due).toISOString();

		const newForm = {
			_id: form._id,
			summary: form.summary,
			description: form.description,
			status: form.status,
			due: form.due,
			categories: form.categories,
			location: form.location,
			geo: form.geo,
			usernameList: form.usernameList,
			alarms: form.alarms
		};

		console.log("Form inviato:", { ...newForm });

		const response = await fetch("/api/calendar/activity/modify", {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({ ...newForm })
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

	async function handleDelete() {
		const response = await fetch("/api/calendar/activity/delete", {
			method: "DELETE",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({ _id: form._id })
		});

		if (response.ok) {
			alert("Attività eliminata con successo!");
			window.location.reload();
		}
	}

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
		<StandardModal
			title="Modifica Attività"
			titleIcon={<i className="bi bi-pencil me-2" />}
			saveBtnText="Modifica"
			show={show}
			handleClose={() => setShow(false)}
			handleSubmit={handleSubmit}
		>
			<StandardInput
				type="text"
				name="summary"
				title="Titolo"
				value={form.summary}
				onChange={handleChange}
				placeholder="Inserisci titolo"
			/>
			<StandardInput
				type="textarea"
				name="description"
				title="Descrizione"
				value={form.description}
				onChange={handleChange}
				placeholder="Inserisci descrizione"
			/>
			<StandardInput
				type="select"
				name="status"
				title="Stato"
				value={form.status}
				onChange={handleChange}
				optionMap={{
					"NEEDS-ACTION": "Da fare",
					COMPLETED: "Completata",
					"IN-PROCESS": "In corso",
					CANCELLED: "Cancellata"
				}}
			/>
			<StandardInput
				type="datetime-local"
				name="due"
				title="Consegna"
				value={moment(form.due).format("YYYY-MM-DDTHH:mm")}
				onChange={handleChange}
				placeholder="Inserisci consegna"
			/>

			<StandardInput
				type="text"
				name="categories"
				title="Categorie (separate da virgola)"
				value={form.categories}
				onChange={handleChange}
				placeholder="Inserisci categorie"
				isRequired={false}
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
				mainId={form._id!}
				usernameList={form.usernameList}
				setUsernameList={handleUsernameListChange}
			/>

			<AlarmSelector alarms={form.alarms} onChange={handleAlarmsChange} />
		</StandardModal>
	);
}
