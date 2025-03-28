"use client";

import { AlarmSelector } from "@/app/calendar/AlarmSelector";
import { InvitationComponent } from "@/app/calendar/InvitationComponent";
import "@/app/calendar/Modal.css";
import { TimezoneSelector } from "@/app/calendar/TimezoneSelector";
import { StringActivity, StringAlarm } from "@/utils/db/db";
import moment from "moment";
import React, { useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";

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
		<>
			<Modal
				show={show}
				onHide={() => setShow(false)}
				centered
				dialogClassName="custom-modal"
				backdropClassName="custom-backdrop"
				fullscreen="lg-down"
			>
				<Modal.Header closeButton className="custom-modal-header">
					<Modal.Title>
						<i className="bi bi-person-plus me-2" />
						Modifica Attività
					</Modal.Title>
				</Modal.Header>
				<Form onSubmit={handleSubmit} className="custom-form">
					<Modal.Body>
						<Form.Group className="mb-3" controlId="formFirstName">
							<Form.Label>Titolo</Form.Label>
							<Form.Control
								type="text"
								name="summary"
								value={form.summary}
								onChange={handleChange}
								placeholder="Inserisci titolo"
								className="input-field"
								required
							/>
							<Form.Label>Descrizione</Form.Label>
							<Form.Control
								as="textarea"
								name="description"
								value={form.description}
								onChange={handleChange}
								placeholder="Inserisci descrizione"
								className="input-field"
								required
							/>
							<Form.Label>Stato</Form.Label>
							<Form.Select
								name="status"
								value={form.status}
								onChange={handleChange}
								className="input-field"
								required
							>
								<option value="NEEDS-ACTION">Da fare</option>
								<option value="COMPLETED">Completata</option>
								<option value="IN-PROCESS">In corso</option>
								<option value="CANCELLED">Cancellata</option>
							</Form.Select>
							<Form.Label>Consegna</Form.Label>
							<Form.Control
								type="datetime-local"
								name="due"
								value={moment(form.due).format(
									"YYYY-MM-DDTHH:mm"
								)}
								onChange={handleChange}
								placeholder="Inserisci consegna"
								className="input-field"
								required
							/>
						</Form.Group>

						<Form.Group className="mb-3" controlId="formCategories">
							<Form.Label>
								Categorie (separate da virgola)
							</Form.Label>
							<Form.Control
								type="text"
								name="categories"
								value={form.categories}
								onChange={handleChange}
								placeholder="Inserisci categorie"
								className="input-field"
							/>
						</Form.Group>

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

						<AlarmSelector
							alarms={form.alarms}
							onChange={handleAlarmsChange}
						/>
					</Modal.Body>
					<Modal.Footer>
						<Button
							variant="danger"
							onClick={handleDelete}
							className="custom-cancel-button"
						>
							Elimina
						</Button>
						<Button
							variant="secondary"
							onClick={() => setShow(false)}
							className="custom-cancel-button"
						>
							Annulla
						</Button>
						<Button
							variant="primary"
							type="submit"
							className="custom-submit-button"
						>
							Modifica Attività
						</Button>
					</Modal.Footer>
				</Form>
			</Modal>
		</>
	);
}
