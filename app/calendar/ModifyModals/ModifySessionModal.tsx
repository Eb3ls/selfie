"use client";

import { AlarmSelector } from "@/app/calendar/AlarmSelector";
import { StandardInput } from "@/app/components/StandardInput";
import { StandardToggleModal } from "@/app/components/StandardToggleModal";
// nuovo import
import { StandardViewField } from "@/app/components/StandardViewFIeld";
import {
	StringAlarm,
	StringPomodoroSettings,
	StringSession
} from "@/utils/db/db";
import { safeFetch } from "@/utils/fetch/fetch";
import moment from "moment-timezone";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Button, Form } from "react-bootstrap";
import { toast } from "react-toastify";
import {
	PomodoroBlock,
	getDeleteContent,
	getTextFromStatus,
	getTextFromTriggerList
} from "../calendarUtils/calendarUX";

type StringSessionForm = Omit<StringSession, "settingsList"> & {
	settings: StringPomodoroSettings;
};

export function ModifySessionModal({
	session,
	show,
	setShow,
	startOfSelectedSession,
	mutate
}: {
	session: StringSession;
	show: boolean;
	setShow: (show: boolean) => void;
	startOfSelectedSession: Date;
	mutate: () => void;
}) {
	const rawSession: StringSession = { ...session };
	const newSession: StringSessionForm = {
		...rawSession,
		settings: session.settingsList
			.filter(
				(s) =>
					new Date(s.modificationDate) <=
					new Date(startOfSelectedSession)
			)
			.sort(
				(a, b) =>
					new Date(b.modificationDate).getTime() -
					new Date(a.modificationDate).getTime()
			)[0]
	};
	const [form, setForm] = useState(newSession);
	const [userToInvite, setUserToInvite] = useState("");

	const router = useRouter();

	useEffect(() => {
		const rawSession: StringSession = { ...session };
		const newSession: StringSessionForm = {
			...rawSession,
			settings: session.settingsList
				.filter(
					(s) =>
						new Date(s.modificationDate) <=
						new Date(startOfSelectedSession)
				)
				.sort(
					(a, b) =>
						new Date(b.modificationDate).getTime() -
						new Date(a.modificationDate).getTime()
				)[0]
		};
		setForm(newSession);
	}, [session, startOfSelectedSession]);

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

	const handleChangePomodoro = (e: React.ChangeEvent<HTMLInputElement>) => {
		setForm({
			...form,
			settings: {
				...form.settings,
				[e.target.name]: parseInt(e.target.value)
			}
		});
	};

	const handleShare = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (userToInvite === "") {
			return;
		}

		const body = {
			username: userToInvite
		};

		const response = await safeFetch(
			fetch("/api/calendar/session/" + session._id + "/share", {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify(body)
			})
		);

		if (response.ok) {
			toast.success("Impostazioni condivise con successo!");
		} else {
			toast.error("Errore durante la condivisione delle impostazioni");
		}

		setUserToInvite("");
	};

	// Gestisce il submit del form
	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		const newForm = {
			_id: form._id,
			summary: form.summary,
			description: form.description,
			status: form.status,
			newSetting: {
				cycles: form.settings.cycles,
				studyTime: form.settings.studyTime,
				breakTime: form.settings.breakTime
			},
			alarms: form.alarms,
			dateToChange: startOfSelectedSession.toISOString()
		};

		const response = await safeFetch(
			fetch("/api/calendar/session/modify", {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify(newForm)
			})
		);

		if (response.ok) {
			toast.success("Sessione modificata con successo!");
			setShow(false);
			mutate();
		} else {
			toast.error("Errore durante la modifica della sessione");
		}
	};

	async function handleDelete() {
		const response = await safeFetch(
			fetch("/api/calendar/session/delete", {
				method: "DELETE",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({ _id: form._id })
			})
		);

		if (response.ok) {
			toast.success("Sessione eliminata con successo!");
			setShow(false);
			mutate();
		} else {
			toast.error("Errore durante l'eliminazione della sessione");
		}
	}

	function handleRedirect() {
		router.push("/pomodoro?id=" + form._id);
	}

	const handleAlarmsChange = (newAlarms: StringAlarm[]) => {
		setForm({
			...form,
			alarms: newAlarms
		});
	};

	function getViewContent() {
		return (
			<>
				<StandardViewField title="Titolo" value={newSession.summary} />
				<StandardViewField
					title="Descrizione"
					value={newSession.description || "-"}
				/>
				<StandardViewField
					title="Stato"
					value={getTextFromStatus(newSession.status)}
				/>
				<StandardViewField
					title="Inizio"
					value={moment(newSession.dtStart).format(
						"DD/MM/YYYY HH:mm"
					)}
				/>
				<StandardViewField
					title="Fine"
					value={moment(newSession.dtEnd).format("DD/MM/YYYY HH:mm")}
				/>

				<PomodoroBlock
					cycles={newSession.settings.cycles}
					studyTime={newSession.settings.studyTime}
					breakTime={newSession.settings.breakTime}
					mode={"view"}
				/>

				<StandardViewField
					title="Promemoria"
					value={getTextFromTriggerList(newSession.alarms)}
				/>
				<div className="text-center mt-4">
					<Button
						variant="success"
						size="lg"
						onClick={handleRedirect}
						className="px-4 py-2"
					>
						<i className="bi bi-play-circle-fill me-2"></i>
						Vai al Pomodoro
					</Button>
				</div>
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
						TENTATIVE: "Provvisorio",
						CONFIRMED: "Confermato",
						CANCELLED: "Cancellato"
					}}
				/>

				<PomodoroBlock
					cycles={form.settings.cycles}
					studyTime={form.settings.studyTime}
					breakTime={form.settings.breakTime}
					handleChangePomodoro={handleChangePomodoro}
					mode="edit"
				/>

				<AlarmSelector
					alarms={form.alarms}
					onChange={handleAlarmsChange}
				/>
			</>
		);
	}

	function getShareContent() {
		return (
			<Form.Group className="mb-3" controlId="formInviteUser">
				<Form.Label>Condividi impostazioni</Form.Label>
				<div className="d-flex">
					<Form.Control
						type="text"
						placeholder="Inserisci nome utente"
						className="input-field"
						value={userToInvite}
						onChange={(e) => setUserToInvite(e.target.value)}
					/>
				</div>
			</Form.Group>
		);
	}

	const mainView = {
		title: "Dettagli",
		handleClose: () => setShow(false),
		renderChildren: () => getViewContent()
	};

	const singleViewsMap = {
		Condividi: {
			title: "Condividi Sessione",
			buttonColor: "success",
			icon: <i className="bi bi-person-plus me-2" />,
			saveBtnText: "Condividi",
			onSubmit: handleShare,
			renderChildren: () => getShareContent()
		},
		Modifica: {
			title: "Modifica Sessione",
			buttonColor: "primary",
			icon: <i className="bi bi-pencil me-2" />,
			saveBtnText: "Modifica",
			onSubmit: handleSubmit,
			renderChildren: () => getEditContent()
		},
		Elimina: {
			title: "Elimina Sessione",
			buttonColor: "danger",
			icon: <i className="bi bi-trash me-2" />,
			saveBtnText: "",
			onSubmit: (e: React.FormEvent<HTMLFormElement>) => {
				e.preventDefault();
				handleDelete();
			},
			renderChildren: () =>
				getDeleteContent(form.summary, handleDelete, "SESSION")
		}
	};

	return (
		<StandardToggleModal
			show={show}
			mainView={mainView}
			singleViewsMap={singleViewsMap}
		/>
	);
}
