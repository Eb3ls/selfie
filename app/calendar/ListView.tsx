import moment from "moment-timezone";
import { useRef } from "react";
import { CalendarEvent } from "./calendarUtils/calendarTypes";

moment.locale("it");

export function ListView({ events }: { events: CalendarEvent[] }): JSX.Element {
	const listRef = useRef<HTMLDivElement>(null);
	let sortedEvents = events
		.filter(
			(event) =>
				event.typology === "activity" &&
				event.originalElement.status !== "COMPLETED"
		)
		.sort(
			(a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
		);

	const groupedEvents = sortedEvents.reduce(
		(groups, event) => {
			const date = moment(event.start).format("YYYY-MM-DD");
			if (!groups[date]) groups[date] = [];
			groups[date].push(event);
			return groups;
		},
		{} as Record<string, CalendarEvent[]>
	);

	return (
		<div
			className="flex-grow-1 overflow-auto px-3"
			style={{ minHeight: 0 }}
			ref={listRef}
		>
			{Object.entries(groupedEvents).map(([date, dayEvents]) => (
				<div key={date} id={`date-${date}`}>
					<div className="p-3 bg-white rounded-3 mb-3 sticky-top z-0 small-border">
						<h5 className="m-0 fw-bold activity-color-text">
							{moment(date).format("dddd D MMMM YYYY")}
						</h5>
					</div>
					<div>
						{dayEvents.map((event, index) => (
							<div
								key={`${date}-${index}`}
								className="p-3 ms-2 mb-3 bg-white shadow-sm hover-lift rounded-3 activity-color-border"
								style={{
									borderLeft: "5px solid"
								}}
							>
								<div className="text-muted mb-1">
									{moment(event.start).format("HH:mm")}
								</div>
								<div>{event.title}</div>
							</div>
						))}
					</div>
				</div>
			))}
			{Object.entries(groupedEvents).length === 0 && (
				<div className="p-3 ms-4 mb-3 bg-white shadow-sm hover-lift rounded-3 activity-color-border">
					<div className="text-muted mb-1">
						Non ci sono attività in programma
					</div>
				</div>
			)}
		</div>
	);
}
