"use client";

import { AlarmSelector } from "@/app/calendar/AlarmSelector";
import "@/app/calendar/Modal.css";
import { StandardInput } from "@/app/components/StandardInput";
import { StandardToggleModal } from "@/app/components/StandardToggleModal";
// nuovo import
import { StandardViewField } from "@/app/components/StandardViewFIeld";
import { StringAlarm, StringSession } from "@/utils/db/db";
import { Trigger } from "@/utils/db/models/Alarm";
import moment from "moment";
import React, { useState } from "react";
import { Button, Card, Col, Form, Row } from "react-bootstrap";
import {
	getDeleteContent,
	getTextFromStatus,
	getTextFromTriggerList
} from "../calendarUtils/calendarUX";

export function ModifySessionModal({
	session,
	show,
	setShow
}: {
	session: StringSession;
	show: boolean;
	setShow: (show: boolean) => void;
}) {
	const newSession: StringSession = { ...session };
	const [form, setForm] = useState(newSession);
	const [userToInvite, setUserToInvite] = useState("");

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
			settingsList: [
				...form.settingsList.slice(0, form.settingsList.length - 1),
				{
					...form.settingsList[form.settingsList.length - 1],
					[e.target.name]: parseInt(e.target.value)
				}
			]
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

		const response = await fetch(
			"/api/calendar/session/" + session._id + "/share",
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify(body)
			}
		);

		if (response.ok) {
			const fetched_data = await response.json();
			alert("Successful: " + fetched_data.message);
		} else {
			alert("Failed! Status code: " + response.status);
		}

		setUserToInvite("");
	};

	// Gestisce il submit del form
	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		const startDateTime = new Date(form.dtStart);
		const pomodoroDuration =
			form.settingsList[form.settingsList.length - 1].cycles *
			(form.settingsList[form.settingsList.length - 1].studyTime +
				form.settingsList[form.settingsList.length - 1].breakTime);
		const endDateTime = new Date(
			startDateTime.getTime() + pomodoroDuration * 60000
		);

		const newForm = {
			_id: form._id,
			summary: form.summary,
			description: form.description,
			status: form.status,
			rrule: form.rrule,
			dtStart: startDateTime.toISOString(),
			dtEnd: endDateTime.toISOString(),
			newSetting: {
				cycles: form.settingsList[form.settingsList.length - 1].cycles,
				studyTime:
					form.settingsList[form.settingsList.length - 1].studyTime,
				breakTime:
					form.settingsList[form.settingsList.length - 1].breakTime
			},
			alarms: form.alarms
		};

		console.log("Primo form inviato:", { ...newForm });

		const response = await fetch("/api/calendar/session/modify", {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({ ...newForm })
		});

		if (response.ok) {
			alert("Sessione modificata con successo!");
			window.location.reload();
		} else {
			alert("Errore nella modifica della sessione!");
		}
	};

	async function handleDelete() {
		const response = await fetch("/api/calendar/session/delete", {
			method: "DELETE",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({ _id: form._id })
		});

		if (response.ok) {
			alert("Sessione eliminata con successo!");
			window.location.reload();
		}
	}

	function handleRedirect() {
		window.location.href = "/pomodoro?id=" + form._id;
	}

	const handleAlarmsChange = (newAlarms: StringAlarm[]) => {
		setForm({
			...form,
			alarms: newAlarms
		});
	};

	function calculateTotalDuration() {
		const cycles =
			form.settingsList[form.settingsList.length - 1].cycles || 0;
		const studyTime =
			form.settingsList[form.settingsList.length - 1].studyTime || 0;
		const breakTime =
			form.settingsList[form.settingsList.length - 1].breakTime || 0;

		return cycles * (studyTime + breakTime);
	}

	function getViewContent() {
		return (
			<>
				<StandardViewField title="Titolo" value={form.summary} />
				<StandardViewField
					title="Descrizione"
					value={session.description || "-"}
				/>
				<StandardViewField
					title="Stato"
					value={getTextFromStatus(session.status)}
				/>
				<StandardViewField
					title="Inizio"
					value={moment(session.dtStart).format("DD/MM/YYYY HH:mm")}
				/>
				<StandardViewField
					title="Fine"
					value={moment(session.dtEnd).format("DD/MM/YYYY HH:mm")}
				/>
				<Card className="mt-4 mb-3">
					<Card.Header>
						<i className="bi bi-alarm me-2"></i>
						Impostazioni Pomodoro
					</Card.Header>
					<Card.Body>
						<Row>
							<Col md={4}>
								<StandardViewField
									title="Cicli"
									value={session.settingsList[
										session.settingsList.length - 1
									].cycles.toString()}
								/>
							</Col>
							<Col md={4}>
								<StandardViewField
									title="Studio (min)"
									value={session.settingsList[
										session.settingsList.length - 1
									].studyTime.toString()}
								/>
							</Col>
							<Col md={4}>
								<StandardViewField
									title="Pausa (min)"
									value={session.settingsList[
										session.settingsList.length - 1
									].breakTime.toString()}
								/>
							</Col>
						</Row>
						<small className="text-muted mt-2 d-block">
							Durata totale: {calculateTotalDuration()} minuti
						</small>
					</Card.Body>
				</Card>
				<StandardViewField
					title="Promemoria"
					value={getTextFromTriggerList(form.alarms)}
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
				<StandardInput
					type="datetime-local"
					name="dtStart"
					title="Data di inizio"
					value={moment(form.dtStart).format("YYYY-MM-DDTHH:mm")}
					onChange={handleChange}
					placeholder="Inserisci data di inizio"
				/>
				{/* Pomodoro settings */}
				<Card className="mt-4 mb-3">
					<Card.Header>
						<i className="bi bi-alarm me-2"></i>
						Impostazioni Pomodoro
					</Card.Header>
					<Card.Body>
						<Row>
							<Col md={4}>
								<StandardInput
									type="number"
									name="cycles"
									title="Cicli"
									min={1}
									value={
										form.settingsList[
											form.settingsList.length - 1
										].cycles
									}
									onChange={handleChangePomodoro}
								/>
							</Col>
							<Col md={4}>
								<StandardInput
									type="number"
									name="studyTime"
									title="Studio (min)"
									min={1}
									value={
										form.settingsList[
											form.settingsList.length - 1
										].studyTime
									}
									onChange={handleChangePomodoro}
								/>
							</Col>
							<Col md={4}>
								<StandardInput
									type="number"
									name="breakTime"
									title="Pausa (min)"
									min={1}
									value={
										form.settingsList[
											form.settingsList.length - 1
										].breakTime
									}
									onChange={handleChangePomodoro}
								/>
							</Col>
						</Row>
						<small className="text-muted mt-2 d-block">
							Durata totale: {calculateTotalDuration()} minuti
						</small>
					</Card.Body>
				</Card>
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
		title: "Dettagli Sessione",
		handleClose: () => setShow(false),
		renderChildren: () => getViewContent()
	};

	const singleViewsMap = {
		Condividi: {
			title: "Condividi Impostazioni Sessione",
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
