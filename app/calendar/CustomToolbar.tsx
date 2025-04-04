"use client";

import { AddActivityModal } from "@/app/calendar/AddModals/AddActivityModal";
import { AddEventModal } from "@/app/calendar/AddModals/AddEventModal";
import { AddSessionModal } from "@/app/calendar/AddModals/AddSessionModal";
import moment from "moment";
import { SetStateAction } from "react";
import { View } from "react-big-calendar";
import { ResourcesModal } from "./ResourcesModal";

function obtainFormattedDate(currentDate: Date, calendarView: View): string {
	let startOf: "month" | "week" | "day";

	if (calendarView === "month") {
		startOf = "month";
	} else if (calendarView === "week") {
		startOf = "week";
	} else {
		startOf = "day";
	}

	const start = moment(currentDate).startOf(startOf);
	const end = moment(currentDate).endOf(startOf);

	if (calendarView === "month") {
		return start.format("MMMM YYYY");
	} else if (calendarView === "week") {
		return `${start.format("D MMMM")} - ${end.format("D MMMM YYYY")}`;
	} else {
		return start.format("D MMMM YYYY");
	}
}

interface CustomToolbarProps {
	currentDate: Date;
	calendarView: View;
	currentView: "calendar" | "list";
	setCurrentDate: (value: SetStateAction<Date>) => void;
	setCalendarView: (value: SetStateAction<View>) => void;
	setCurrentView: (value: SetStateAction<"calendar" | "list">) => void;
}

export function CustomToolbar({
	currentDate,
	calendarView,
	currentView,
	setCurrentDate,
	setCalendarView,
	setCurrentView
}: CustomToolbarProps) {
	const formattedDate = obtainFormattedDate(currentDate, calendarView);

	function switchView() {
		setCurrentView((prev) => (prev === "list" ? "calendar" : "list"));
	}

	return (
		<div className="rbc-toolbar">
			<div className="toolbar-left">
				<div className="toolbar-controls">
					<button
						onClick={() =>
							setCurrentDate(
								moment(currentDate)
									.subtract(
										1,
										calendarView === "month"
											? "month"
											: calendarView === "week"
												? "week"
												: "day"
									)
									.toDate()
							)
						}
						className="nav-button"
					>
						‹
					</button>
					<span className="current-date">{formattedDate}</span>
					<button
						onClick={() =>
							setCurrentDate(
								moment(currentDate)
									.add(
										1,
										calendarView === "month"
											? "month"
											: calendarView === "week"
												? "week"
												: "day"
									)
									.toDate()
							)
						}
						className="nav-button"
					>
						›
					</button>
				</div>
				<select
					value={calendarView}
					onChange={(e) => setCalendarView(e.target.value as View)}
					className="view-select"
					disabled={currentView === "list"}
				>
					{["month", "week", "day"].map((view) => (
						<option key={view} value={view}>
							{view === "month"
								? "Mese"
								: view === "week"
									? "Settimana"
									: "Giorno"}
						</option>
					))}
				</select>
			</div>

			<div className="toolbar-right">
				<a
					href="/api/calendar/exportCalendar"
					className="download-button"
				>
					<button className="add-button download">
						Scarica calendario
					</button>
				</a>
				<button
					onClick={switchView}
					className={`view-switch-button ${
						currentView === "list" ? "to-calendar" : "to-list"
					}`}
				>
					{currentView === "list" ? "Calendario" : "Lista"}
				</button>
				<div className="d-flex gap-2 p-2 align-items-center">
					<AddActivityModal>
						<button className="add-button activity">
							<span>+</span> Attività
						</button>
					</AddActivityModal>
					<AddEventModal>
						<button className="add-button event">
							<span>+</span> Evento
						</button>
					</AddEventModal>
					<AddSessionModal>
						<button className="add-button session">
							<span>+</span> Sessione
						</button>
					</AddSessionModal>
					<ResourcesModal />
				</div>
			</div>
		</div>
	);
}
