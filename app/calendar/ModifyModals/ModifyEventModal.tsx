"use client";

import { AlarmSelector } from "@/app/calendar/AlarmSelector";
import { InvitationComponent } from "@/app/calendar/InvitationComponent";
import "@/app/calendar/Modal.css";
import { TimezoneSelector } from "@/app/calendar/TimezoneSelector";
import { StandardInput } from "@/app/components/StandardInput";
import { StandardToggleModal } from "@/app/components/StandardToggleModal";
import { StandardViewField } from "@/app/components/StandardViewFIeld";
import { StringAlarm, StringEvent } from "@/utils/db/db";
import { Trigger } from "@/utils/db/models/Alarm";
import moment from "moment";
import React, { useState } from "react";

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

	function getTextFromTrigger(trigger: Trigger): string {
		switch (trigger) {
			case "-PT0S":
				return "Al momento dell'evento";
			case "-PT10M":
				return "10 minuti prima";
			case "-PT1H":
				return "1 ora prima";
			case "-PT1D":
				return "1 giorno prima";
			default:
				return "";
		}
	}

	function getViewContent() {
		return (
			<>
				<StandardViewField title="Titolo" value={form.summary} />
				<StandardViewField
					title="Descrizione"
					value={form.description || "-"}
				/>
				<StandardViewField
					title="Stato"
					value={
						{
							TENTATIVE: "Provvisorio",
							CONFIRMED: "Confermato",
							CANCELLED: "Cancellato"
						}[form.status] || form.status
					}
				/>
				<StandardViewField
					title="Inizio"
					value={moment(form.dtStart).format("DD/MM/YYYY HH:mm")}
				/>
				<StandardViewField
					title="Fine"
					value={moment(form.dtEnd).format("DD/MM/YYYY HH:mm")}
				/>
				<StandardViewField
					title="Categorie"
					value={form.categories || "-"}
				/>
				<StandardViewField
					title="Fuso orario"
					value={form.geo || "-"}
				/>
				<StandardViewField
					title="Partecipanti"
					value={form.usernameList.join(", ") || "-"}
				/>
				<StandardViewField
					title="Promemoria"
					value={
						form.alarms
							.map((a) => `${getTextFromTrigger(a.trigger)}`)
							.join(", ") || "Nessuno"
					}
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

				<InvitationComponent
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

	function getDeleteContent() {
		return (
			<div className="text-center">
				<i className="bi bi-exclamation-triangle text-warning display-1 mb-4 d-block" />
				<h4 className="mb-4">
					Sei sicuro di voler eliminare questo evento?
				</h4>
				<p className="mb-4 text-muted">{form.summary}</p>
				<button
					className="btn btn-danger btn-lg"
					onClick={(e) => {
						e.preventDefault();
						handleDelete();
					}}
				>
					<i className="bi bi-trash me-2" />
					Conferma Eliminazione
				</button>
			</div>
		);
	}

	const mainView = {
		title: "Dettagli Evento",
		handleClose: () => setShow(false),
		renderChildren: () => {
			return getViewContent();
		}
	};

	function getSingleViewMap() {
		if (form.ownerId === currentUserId) {
			return {
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
					onSubmit: (e: React.FormEvent<HTMLFormElement>) => {
						e.preventDefault();
						handleDelete();
					},
					renderChildren: () => {
						return getDeleteContent();
					}
				}
			};
		}
		return null;
	}

	return (
		<StandardToggleModal
			show={show}
			mainView={mainView}
			singleViewsMap={getSingleViewMap()}
		/>
	);
}
