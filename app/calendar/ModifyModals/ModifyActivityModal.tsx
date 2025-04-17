"use client";

import { AlarmSelector } from "@/app/calendar/AlarmSelector";
import { TimezoneSelector } from "@/app/calendar/TimezoneSelector";
import { StandardInput } from "@/app/components/StandardInput";
import { StandardToggleModal } from "@/app/components/StandardToggleModal";
import { StandardUsersInput } from "@/app/components/StandardUsersInput";
import { StandardViewField } from "@/app/components/StandardViewFIeld";
import { StringActivity, StringAlarm } from "@/utils/db/db";
import { safeFetch } from "@/utils/fetch/fetch";
import moment from "moment-timezone";
import React, { useState } from "react";
import { toast } from "react-toastify";
import {
	getDeleteContent,
	getDropContent,
	getTextFromStatus,
	getTextFromTriggerList
} from "../calendarUtils/calendarUX";

type StringActivityFrontend = Omit<StringActivity, "userIdList"> & {
	usernameList: string[];
};

export function ModifyActivityModal({
	activity,
	show,
	setShow,
	currentUserId,
	mutate
}: {
	activity: StringActivityFrontend;
	show: boolean;
	setShow: (show: boolean) => void;
	currentUserId: string;
	mutate: () => void;
}) {
	const newActivity: StringActivityFrontend = {
		...activity
	};
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
		const endTime = new Date(form.due).toISOString();

		const newForm = {
			_id: form._id,
			summary: form.summary,
			description: form.description,
			status: form.status,
			due: endTime,
			categories: form.categories,
			location: form.location,
			geo: form.geo,
			usernameList: form.usernameList,
			alarms: form.alarms
		};

		const response = await safeFetch<any, any>(
			fetch("/api/calendar/activity/modify", {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify(newForm)
			})
		);

		if (response.ok) {
			toast.success("Attività modificata con successo!");
			setShow(false);
			mutate();
		} else if (response.status === 400) {
			const out = response.body;
			if (out && out.message === undefined && out.users) {
				toast.error(
					"Errore durante la modifica dell'attività. Non è stato trovato l'utente: " +
						out.users[0]
				);
			} else {
				toast.error("Errore durante la creazione dell'attività");
			}
		} else {
			toast.error("Errore durante la creazione dell'attività");
		}
	};

	async function handleDelete() {
		const response = await safeFetch(
			fetch("/api/calendar/activity/delete", {
				method: "DELETE",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({ _id: form._id })
			})
		);

		if (response.ok) {
			toast.error("Attività eliminata con successo!");
			setShow(false);
			mutate();
		} else {
			toast.error("Errore durante l'eliminazione dell'attività");
		}
	}

	async function handleDrop() {
		const response = await safeFetch(
			fetch("/api/calendar/quit", {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({ _id: form._id, type: "ACTIVITY" })
			})
		);

		if (response.ok) {
			toast.error("Attività abbandonata con successo!");
			setShow(false);
			mutate();
		} else {
			toast.error("Errore durante l'abbandono dell'attività");
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
		function generateConversionProps(
			text: string,
			dateToConvert: string | undefined,
			regularTimezone: string
		) {
			if (!dateToConvert) return;
			if (dateToConvert === "") return;
			if (regularTimezone === "") return;

			return (
				<p className="text-muted m-0 p-0">
					{text}:{" "}
					{moment(dateToConvert)
						.tz(regularTimezone)
						.format("YYYY-MM-DD HH:mm")}
				</p>
			);
		}

		return (
			<>
				<StandardViewField title="Titolo" value={newActivity.summary} />
				<StandardViewField
					title="Descrizione"
					value={newActivity.description || "-"}
				/>
				<StandardViewField
					title="Stato"
					value={getTextFromStatus(newActivity.status)}
				/>
				<StandardViewField
					title="Consegna"
					value={moment(newActivity.due).format("DD/MM/YYYY HH:mm")}
				/>
				<StandardViewField
					title="Categorie"
					value={newActivity.categories || "-"}
				/>
				<StandardViewField
					title="Fuso orario"
					value={
						<>
							{newActivity.geo || "-"}
							{newActivity.geo &&
								generateConversionProps(
									"Consegna",
									newActivity.due,
									newActivity.geo
								)}
						</>
					}
				/>
				<StandardViewField
					title="Partecipanti"
					value={newActivity.usernameList.join(", ") || "-"}
				/>
				<StandardViewField
					title="Promemoria"
					value={getTextFromTriggerList(newActivity.alarms)}
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
					isRequired={false}
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
				<StandardUsersInput
					originalUsenameList={newActivity.usernameList}
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
		let title = "Dettagli";
		if (activity.ownerId !== currentUserId) {
			title += " (Ospite)";
		}

		return {
			title: title,
			handleClose: () => setShow(false),
			renderChildren: () => {
				return getViewContent();
			}
		};
	}

	function getSingleViewMap() {
		const ownerViews = {
			Modifica: {
				title: "Modifica Attività",
				buttonColor: "primary",
				icon: <i className="bi bi-pencil me-2" />,
				saveBtnText: "Modifica",
				onSubmit: handleSubmit,
				renderChildren: () => {
					return getEditContent();
				}
			},
			Elimina: {
				title: "Elimina Attività",
				buttonColor: "danger",
				icon: <i className="bi bi-trash me-2" />,
				saveBtnText: "",
				onSubmit: undefined,
				renderChildren: () => {
					return getDeleteContent(
						form.summary,
						handleDelete,
						"ACTIVITY"
					);
				}
			}
		};

		const guestViews = {
			Abbandona: {
				title: "Abbandona Attività",
				buttonColor: "danger",
				saveBtnText: "",
				onSubmit: undefined,
				renderChildren: () => {
					return getDropContent(form.summary, handleDrop, false);
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
