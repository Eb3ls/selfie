"use client";

import moment from "moment";
import { SetStateAction } from "react";
import { View } from "react-big-calendar";

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

interface LittleCustomToolbarProps {
	currentDate: Date;
	calendarView: View;
	setCurrentDate: (value: SetStateAction<Date>) => void;
	setCalendarView: (value: SetStateAction<View>) => void;
}

export function LittleCustomToolbar({
	currentDate,
	calendarView,
	setCurrentDate,
	setCalendarView
}: LittleCustomToolbarProps) {
	const formattedDate = obtainFormattedDate(currentDate, calendarView);

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
	);
}
