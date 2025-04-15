"use client";

import moment from "moment-timezone";
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
		<div className="container-fluid py-3">
			<div className="row align-items-center justify-content-between gy-3">
				<div className="col-12 col-md-auto">
					<div className="d-flex align-items-center gap-3">
						<button
							className="btn p-2"
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
						<span className="fs-3 mb-0 fw-semibold">
							{formattedDate}
						</span>
						<button
							className="btn p-2"
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
						<select
							className="form-select w-auto rounded-pill"
							value={calendarView}
							onChange={(e) =>
								setCalendarView(e.target.value as View)
							}
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
			</div>
		</div>
	);
}
