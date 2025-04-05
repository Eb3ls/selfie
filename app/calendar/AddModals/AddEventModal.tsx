"use client";

import { AlarmSelector } from "@/app/calendar/AlarmSelector";
import "@/app/calendar/Modal.css";
import { TimezoneSelector } from "@/app/calendar/TimezoneSelector";
import { StandardInput } from "@/app/components/StandardInput";
import { StandardModal } from "@/app/components/StandardModal";
import { StandardRepetitionInput } from "@/app/components/StandardRepetitionInput";
import { StandardUsersInput } from "@/app/components/StandardUsersInput";
import { StringAlarm } from "@/utils/db/db";
import React, { useState } from "react";
import { Form } from "react-bootstrap";
import { ResourceInvitationComponent } from "../ResourceInvitationComponent";

export function AddEventModal({ children }: any) {
	const [show, setShow] = useState(false);
	const [enableRecurrence, setEnableRecurrence] = useState(false); // Stato per abilitare/disabilitare la ripetizione
	const [recurrenceType, setRecurrenceType] = useState<
		"DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY"
	>("DAILY"); // Tipo di ripetizione
	const [recurrenceEnd, setRecurrenceEnd] = useState<
		"NEVER" | "UNTIL_EVENT_END" | "COUNT"
	>("NEVER"); // Fine della ripetizione
	const [recurrenceEndDate, setRecurrenceEndDate] = useState("");
	const [recurrenceCount, setRecurrenceCount] = useState<number>(1); // Numero di occorrenze
	const [weeklyDays, setWeeklyDays] = useState<string[]>([]); // Giorni della settimana per ripetizione settimanale
	const [monthlyDays, setMonthlyDays] = useState<number[]>([]); // Giorni del mese per ripetizione mensile
	const [yearlyMonths, setYearlyMonths] = useState<string[]>([]); // Mesi per ripetizione annuale

	const [form, setForm] = useState({
		summary: "",
		description: "",
		status: "TENTATIVE", // Stato predefinito
		rrule: "",
		dtStart: "",
		dtEnd: "",
		categories: "", // Ora è una stringa
		location: "",
		geo: "",
		usernameList: [] as string[],
		alarms: [] as StringAlarm[]
	});

	const [resourceList, setResourceList] = useState<string[]>([]);

	const handleChange = (
		e: React.ChangeEvent<
			HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
		>
	) => {
		const { name, value } = e.target;
		setForm({
			...form,
			[name]: value
		});
	};

	const handleRecurrenceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setEnableRecurrence(e.target.checked);
		if (!e.target.checked) {
			setForm({ ...form, rrule: "" }); // Resetta l'rrule se la ripetizione è disabilitata
		}
	};

	const generateRRule = () => {
		let rrule = `FREQ=${recurrenceType}`;

		if (recurrenceType === "WEEKLY" && weeklyDays.length > 0) {
			rrule += `;BYDAY=${weeklyDays.join(",")}`;
		} else if (recurrenceType === "MONTHLY" && monthlyDays.length > 0) {
			rrule += `;BYMONTHDAY=${monthlyDays.join(",")}`;
		} else if (recurrenceType === "YEARLY" && yearlyMonths.length > 0) {
			rrule += `;BYMONTH=${yearlyMonths.join(",")}`;
		}

		if (recurrenceEnd === "COUNT") {
			rrule += `;COUNT=${recurrenceCount}`;
		} else if (recurrenceEnd === "UNTIL_EVENT_END" && recurrenceEndDate) {
			rrule += `;UNTIL=${new Date(recurrenceEndDate).toISOString().replace(/[-:]/g, "").split(".")[0]}Z`;
		}

		return rrule;
	};

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		// Converti le date in formato ISO
		form.dtStart = new Date(form.dtStart).toISOString();
		form.dtEnd = new Date(form.dtEnd).toISOString();

		// Aggiungiamo le risorse
		const usernames = form.usernameList.concat(resourceList);

		// Genera l'rrule se la ripetizione è abilitata
		if (enableRecurrence) {
			form.rrule = generateRRule();
		}

		console.log("Form inviato:", { ...form });

		const response = await fetch("/api/calendar/event/add", {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({ ...form, usernameList: usernames })
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
				title="Nuovo Evento"
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
					type="select"
					name="status"
					title="Stato"
					onChange={handleChange}
					value={form.status}
					optionMap={{
						TENTATIVE: "Provvisorio",
						CONFIRMED: "Confermato"
					}}
				/>

				<StandardInput
					type="datetime-local"
					name="dtStart"
					title="Data di inizio"
					onChange={handleChange}
					value={form.dtStart}
				/>

				<StandardInput
					type="datetime-local"
					name="dtEnd"
					title="Data di fine"
					onChange={handleChange}
					value={form.dtEnd}
				/>

				<div className="mt-4 mb-3 p-3 border rounded bg-light">
					<div className="d-flex align-items-center justify-content-between">
						<div>
							<h6 className="mb-1">Ripetizione evento</h6>
							<small className="text-muted">
								{enableRecurrence
									? "L'evento si ripeterà secondo le regole specificate"
									: "L'evento si verificherà una sola volta"}
							</small>
						</div>
						<Form.Check
							type="switch"
							id="recurrence-switch"
							checked={enableRecurrence}
							onChange={handleRecurrenceChange}
							className="fs-6 ms-3"
						/>
					</div>
				</div>
				{enableRecurrence && (
					<StandardRepetitionInput
						recurrenceType={recurrenceType}
						setRecurrenceType={setRecurrenceType}
						recurrenceEnd={recurrenceEnd}
						setRecurrenceEnd={setRecurrenceEnd}
						recurrenceEndDate={recurrenceEndDate}
						setRecurrenceEndDate={setRecurrenceEndDate}
						recurrenceCount={recurrenceCount}
						setRecurrenceCount={setRecurrenceCount}
						weeklyDays={weeklyDays}
						setWeeklyDays={setWeeklyDays}
						monthlyDays={monthlyDays}
						setMonthlyDays={setMonthlyDays}
						yearlyMonths={yearlyMonths}
						setYearlyMonths={setYearlyMonths}
					/>
				)}

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
					mainId={"42"}
					usernameList={form.usernameList}
					setUsernameList={handleUsernameListChange}
				/>

				<ResourceInvitationComponent
					mainId={"42"}
					resourceList={resourceList}
					setResourceList={setResourceList}
				/>

				<AlarmSelector
					alarms={form.alarms}
					onChange={handleAlarmsChange}
				/>
			</StandardModal>
		</>
	);
}
