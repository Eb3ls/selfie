"use client";

import { AddActivityModal } from "@/app/calendar/AddModals/AddActivityModal";
import { AddEventModal } from "@/app/calendar/AddModals/AddEventModal";
import { AddSessionModal } from "@/app/calendar/AddModals/AddSessionModal";
import moment from "moment-timezone";
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
	mutate: () => void;
}

export function CustomToolbar({
	currentDate,
	calendarView,
	currentView,
	setCurrentDate,
	setCalendarView,
	setCurrentView,
	mutate
}: CustomToolbarProps) {
	const formattedDate = obtainFormattedDate(currentDate, calendarView);

	function switchView() {
		setCurrentView((prev) => (prev === "list" ? "calendar" : "list"));
	}

	return (
		<div className="container-fluid py-2">
			<div className="row align-items-center justify-content-between gy-3">
				<div className="col-12 col-md-auto">
					<div className="d-flex align-items-center gap-3 flex-column flex-md-row">
						<div className="w-100 d-flex justify-content-center align-items-center">
							<button
								className="btn p-2 me-2"
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
							>
								<i className="bi bi-chevron-left"></i>
							</button>
							<span className="mb-0 fw-semibold fs-3 text-center">
								{formattedDate}
							</span>
							<button
								className="btn p-2 ms-2"
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
							>
								<i className="bi bi-chevron-right"></i>
							</button>
						</div>
						<select
							className="form-select w-auto rounded-pill"
							value={calendarView}
							onChange={(e) =>
								setCalendarView(e.target.value as View)
							}
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
				</div>

				<div className="col-12 col-md-auto">
					<div className="d-flex flex-wrap gap-2 align-items-center justify-content-center justify-content-md-end">
						<a
							href="/api/calendar/exportCalendar"
							className="text-decoration-none"
						>
							<button className="btn btn-sm p-2 rounded-pill download-color text-white hover-lift rounded-pill shadow-sm fw-semibold">
								<i className="bi bi-download me-1"></i>Scarica
							</button>
						</a>
						<button
							className="btn btn-sm p-2 rounded-pill list-color text-white hover-lift rounded-pill shadow-sm fw-semibold"
							onClick={switchView}
						>
							{currentView === "list" ? (
								<>
									<i className="bi bi-calendar3 me-1"></i>
									Calendario
								</>
							) : (
								<>
									<i className="bi bi-list-ul me-1"></i>Lista
								</>
							)}
						</button>
						<div className="d-block d-md-none">
							<ResourcesModal />
						</div>
						<div className="d-flex gap-2 align-items-center">
							<AddActivityModal mutate={mutate}>
								<button className="btn btn-sm p-2 activity-color text-white hover-lift rounded-pill shadow-sm fw-semibold">
									<i className="bi bi-plus-lg me-1"></i>
									Attività
								</button>
							</AddActivityModal>
							<AddEventModal mutate={mutate}>
								<button className="btn btn-sm p-2 event-color text-white hover-lift rounded-pill shadow-sm fw-semibold">
									<i className="bi bi-plus-lg me-1"></i>Evento
								</button>
							</AddEventModal>
							<AddSessionModal mutate={mutate}>
								<button className="btn btn-sm p-2 session-color text-white hover-lift rounded-pill shadow-sm fw-semibold">
									<i className="bi bi-plus-lg me-1"></i>
									Sessione
								</button>
							</AddSessionModal>
							<div className="d-none d-md-block">
								<ResourcesModal />
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
