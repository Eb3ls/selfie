"use client";

import { AlarmSelector } from "@/app/calendar/AlarmSelector";
import { TimezoneSelector } from "@/app/calendar/TimezoneSelector";
import { StandardInput } from "@/app/components/StandardInput";
import { StandardToggleModal } from "@/app/components/StandardToggleModal";
import { StandardUsersInput } from "@/app/components/StandardUsersInput";
import { StandardViewField } from "@/app/components/StandardViewFIeld";
import { StringActivity, StringAlarm } from "@/utils/db/db";
import moment from "moment";
import React, { useState } from "react";
import { ResourceInvitationComponent } from "../ResourceInvitationComponent";
import { divideResourcesFromUserList } from "../calendarUtils/calendarFetch";
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
	currentUserId
}: {
	activity: StringActivityFrontend;
	show: boolean;
	setShow: (show: boolean) => void;
	currentUserId: string;
}) {
	const { users, resources } = divideResourcesFromUserList(
		activity.usernameList
	);
	const newActivity: StringActivityFrontend = {
		...activity,
		usernameList: users
	};
	const [form, setForm] = useState(newActivity);
	const [resourceList, setResourceList] = useState<string[]>(resources);

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

		// Aggiungiamo le risorse
		const usernames = form.usernameList.concat(resourceList);

		const newForm = {
			_id: form._id,
			summary: form.summary,
			description: form.description,
			status: form.status,
			due: form.due,
			categories: form.categories,
			location: form.location,
			geo: form.geo,
			usernameList: usernames,
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

	async function handleDrop() {
		const response = await fetch("/api/calendar/quit", {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({ _id: form._id, type: "ACTIVITY" })
		});

		if (response.ok) {
			alert("Attività abbandonata con successo!");
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
				<StandardViewField title="Titolo" value={activity.summary} />
				<StandardViewField
					title="Descrizione"
					value={activity.description || "-"}
				/>
				<StandardViewField
					title="Stato"
					value={getTextFromStatus(activity.status)}
				/>
				<StandardViewField
					title="Consegna"
					value={moment(activity.due).format("DD/MM/YYYY HH:mm")}
				/>
				<StandardViewField
					title="Categorie"
					value={activity.categories || "-"}
				/>
				<StandardViewField
					title="Fuso orario"
					value={
						<>
							{activity.geo || "-"}
							{activity.geo &&
								generateConversionProps(
									"Consegna",
									activity.due,
									activity.geo
								)}
						</>
					}
				/>
				<StandardViewField
					title="Partecipanti"
					value={users.join(", ") || "-"}
				/>
				<StandardViewField
					title="Risorse"
					value={
						resources
							.map((resource) => resource.slice(6))
							.join(", ") || "-"
					}
				/>
				<StandardViewField
					title="Promemoria"
					value={getTextFromTriggerList(form.alarms)}
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
					mainId={form._id!}
					usernameList={form.usernameList}
					setUsernameList={handleUsernameListChange}
				/>
				<ResourceInvitationComponent
					mainId={form._id!}
					resourceList={resourceList}
					setResourceList={setResourceList}
				/>
				<AlarmSelector
					alarms={form.alarms}
					onChange={handleAlarmsChange}
				/>
			</>
		);
	}

	function getMainView() {
		let title = "Dettagli Attività";
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
