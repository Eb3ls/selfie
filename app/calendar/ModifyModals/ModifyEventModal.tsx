"use client";

import { AlarmSelector } from "@/app/calendar/AlarmSelector";
import "@/app/calendar/Modal.css";
import { TimezoneSelector } from "@/app/calendar/TimezoneSelector";
import { StandardInput } from "@/app/components/StandardInput";
import { StandardToggleModal } from "@/app/components/StandardToggleModal";
import { StandardUsersInput } from "@/app/components/StandardUsersInput";
import { StandardViewField } from "@/app/components/StandardViewFIeld";
import { StringAlarm, StringEvent } from "@/utils/db/db";
import moment from "moment";
import React, { useState } from "react";
import {
	getDeleteContent,
	getDropContent,
	getTextFromStatus,
	getTextFromTriggerList
} from "../calendarUtils/calendarUX";

type StringEventFrontend = Omit<StringEvent, "userIdList"> & {
	usernameList: string[];
};

export function ModifyEventModal({
	event,
	show,
	setShow,
	currentUserId
}: {
	event: StringEventFrontend;
	show: boolean;
	setShow: (show: boolean) => void;
	currentUserId: string;
}) {
	const newEvent: StringEventFrontend = { ...event };
	const [form, setForm] = useState(newEvent);

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
		form.dtStart = new Date(form.dtStart).toISOString();
		form.dtEnd = new Date(form.dtEnd).toISOString();

		const newForm = {
			_id: form._id,
			summary: form.summary,
			description: form.description,
			status: form.status,
			rrule: form.rrule,
			dtStart: form.dtStart,
			dtEnd: form.dtEnd,
			categories: form.categories,
			location: form.location,
			geo: form.geo,
			usernameList: form.usernameList,
			alarms: form.alarms
		};

		console.log("Form inviato:", { ...newForm });

		const response = await fetch("/api/calendar/event/modify", {
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
		const response = await fetch("/api/calendar/event/delete", {
			method: "DELETE",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({ _id: form._id })
		});

		if (response.ok) {
			alert("Evento eliminato con successo!");
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

	function getViewContent() {
		return (
			<>
				<StandardViewField title="Titolo" value={event.summary} />
				<StandardViewField
					title="Descrizione"
					value={event.description || "-"}
				/>
				<StandardViewField
					title="Stato"
					value={getTextFromStatus(event.status)}
				/>
				<StandardViewField
					title="Inizio"
					value={moment(event.dtStart).format("DD/MM/YYYY HH:mm")}
				/>
				<StandardViewField
					title="Fine"
					value={moment(event.dtEnd).format("DD/MM/YYYY HH:mm")}
				/>
				<StandardViewField
					title="Categorie"
					value={event.categories || "-"}
				/>
				<StandardViewField
					title="Fuso orario"
					value={event.geo || "-"}
				/>
				<StandardViewField
					title="Partecipanti"
					value={event.usernameList.join(", ") || "-"}
				/>
				<StandardViewField
					title="Promemoria"
					value={getTextFromTriggerList(event.alarms)}
				/>
			</>
		);
	}

	function getEditContent() {
		return (
			<>
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
						TENTATIVE: "Provvisorio",
						CONFIRMED: "Confermato",
						CANCELLED: "Cancellato"
					}}
				/>
				<StandardInput
					type="datetime-local"
					name="dtStart"
					title="Data di inizio"
					value={moment(form.dtStart).format("YYYY-MM-DDTHH:mm")}
					onChange={handleChange}
					placeholder="Inserisci data di inizio"
				/>
				<StandardInput
					type="datetime-local"
					name="dtEnd"
					title="Data di fine"
					value={moment(form.dtEnd).format("YYYY-MM-DDTHH:mm")}
					onChange={handleChange}
					placeholder="Inserisci data di fine"
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
						text: "Data di inizio",
						date: form.dtStart
					}}
					secondDateToConvert={{
						text: "Data di fine",
						date: form.dtEnd
					}}
				/>

				<StandardUsersInput
					mainId={form._id!}
					usernameList={form.usernameList}
					setUsernameList={handleUsernameListChange}
				/>

				<AlarmSelector
					alarms={form.alarms}
					onChange={handleAlarmsChange}
				/>
			</>
		);
	}

	function getMainView() {
		let title = "Dettagli Evento";
		if (event.ownerId !== currentUserId) {
			title += " (Ospite)";
		}

		return {
			title,
			handleClose: () => setShow(false),
			renderChildren: () => {
				return getViewContent();
			}
		};
	}

	function getSingleViewMap() {
		const ownerViews = {
			Modifica: {
				title: "Modifica Evento",
				buttonColor: "primary",
				icon: <i className="bi bi-pencil me-2" />,
				saveBtnText: "Modifica",
				onSubmit: handleSubmit,
				renderChildren: () => {
					return getEditContent();
				}
			},
			Elimina: {
				title: "Elimina Evento",
				buttonColor: "danger",
				icon: <i className="bi bi-trash me-2" />,
				saveBtnText: "",
				// Abbiamo il bottone di conferma nei children
				onSubmit: undefined,
				renderChildren: () => {
					return getDeleteContent(
						form.summary,
						handleDelete,
						"EVENT"
					);
				}
			}
		};

		const guestViews = {
			Abbandona: {
				title: "Abbandona Evento",
				buttonColor: "danger",
				saveBtnText: "",
				// Abbiamo il bottone di conferma nei children
				onSubmit: undefined,
				renderChildren: () => {
					return getDropContent(form.summary, handleDelete, true);
				}
			}
		};

		return form.ownerId === currentUserId ? ownerViews : guestViews;
	}

	return (
		<StandardToggleModal
			show={show}
			mainView={getMainView()}
			singleViewsMap={getSingleViewMap()}
		/>
	);
}
