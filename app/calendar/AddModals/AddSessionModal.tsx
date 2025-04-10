"use client";

import { AlarmSelector } from "@/app/calendar/AlarmSelector";
import { StandardInput } from "@/app/components/StandardInput";
import { StandardModal } from "@/app/components/StandardModal";
import { StandardRepetitionInput } from "@/app/components/StandardRepetitionInput";
import { StringAlarm } from "@/utils/db/db";
import React, { useState } from "react";
import { toast } from "react-toastify";
import { PomodoroBlock } from "../calendarUtils/calendarUX";

interface AddSessionModalProps {
	mutate: () => void;
	children: any;
}

export function AddSessionModal({ mutate, children }: AddSessionModalProps) {
	const [show, setShow] = useState(false);
	const [recurrenceType, setRecurrenceType] = useState<
		"DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY"
	>("DAILY");
	const [weeklyDays, setWeeklyDays] = useState<string[]>([]);
	const [monthlyDays, setMonthlyDays] = useState<number[]>([]);
	const [yearlyMonths, setYearlyMonths] = useState<string[]>([]);
	const [recurrenceEnd, setRecurrenceEnd] = useState<
		"NEVER" | "UNTIL_EVENT_END" | "COUNT"
	>("NEVER"); // Fine della ripetizione
	const [recurrenceEndDate, setRecurrenceEndDate] = useState("");
	const [recurrenceCount, setRecurrenceCount] = useState<number>(1);

	const [form, setForm] = useState({
		summary: "",
		description: "",
		status: "CONFIRMED",
		rrule: "",
		dtStart: "",
		dtEnd: "",
		settings: {
			cycles: 1,
			studyTime: 1,
			breakTime: 1
		},
		alarms: [] as StringAlarm[]
	});

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

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		const startDateTime = new Date(form.dtStart);
		const pomodoroDuration =
			form.settings.cycles *
			(form.settings.studyTime + form.settings.breakTime);
		const endDateTime = new Date(
			startDateTime.getTime() + pomodoroDuration * 60000
		);

		const formData = {
			summary: form.summary,
			description: form.description,
			status: form.status,
			rrule: generateRRule(),
			dtStart: startDateTime.toISOString(),
			dtEnd: endDateTime.toISOString(),
			settings: {
				cycles: form.settings.cycles,
				studyTime: form.settings.studyTime,
				breakTime: form.settings.breakTime
			},
			alarms: form.alarms
		};

		const response = await fetch("/api/calendar/session/add", {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify(formData)
		});

		if (response.status === 200) {
			toast.success("Sessione creata con successo!");
			setShow(false);
			setForm({
				summary: "",
				description: "",
				status: "CONFIRMED",
				rrule: "",
				dtStart: "",
				dtEnd: "",
				settings: {
					cycles: 1,
					studyTime: 1,
					breakTime: 1
				},
				alarms: []
			});
			setRecurrenceType("DAILY");
			setRecurrenceEnd("NEVER");
			setRecurrenceEndDate("");
			setRecurrenceCount(1);
			setWeeklyDays([]);
			setMonthlyDays([]);
			setYearlyMonths([]);
			mutate();
		} else {
			toast.error("Errore durante la creazione della sessione");
		}
	};

	const handleAlarmsChange = (newAlarms: StringAlarm[]) => {
		setForm({
			...form,
			alarms: newAlarms
		});
	};

	return (
		<>
			<span onClick={() => setShow(true)} style={{ cursor: "pointer" }}>
				{children}
			</span>

			<StandardModal
				title="Nuova sessione"
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

				<PomodoroBlock
					cycles={form.settings.cycles}
					studyTime={form.settings.studyTime}
					breakTime={form.settings.breakTime}
					handleChangePomodoro={handleChangePomodoro}
					mode={"edit"}
				/>

				<AlarmSelector
					alarms={form.alarms}
					onChange={handleAlarmsChange}
				/>
			</StandardModal>
		</>
	);
}
