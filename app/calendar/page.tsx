"use client";

import { CustomToolbar } from "@/app/calendar/CustomToolbar";
import { GenericModifyModal } from "@/app/calendar/GenericModifyModal";
import {
	convertToCalendarEvents,
	fetchCalendar
} from "@/app/calendar/calendarUtils/calendarFetch";
import { CalendarEvent } from "@/app/calendar/calendarUtils/calendarTypes";
import { GlobalSideBar } from "@/app/components/GlobalSideBar";
import { useTime } from "@/app/components/TimeContext";
import moment from "moment";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Calendar, View, momentLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Container } from "react-bootstrap";
import useSWR from "swr";
import "./calendar.css";

const localizer = momentLocalizer(moment);

const ListView = ({ events }: { events: CalendarEvent[] }) => {
	return (
		<div className="list-view">
			<div className="list-header">
				<div className="header-item">Data</div>
				<div className="header-item">Attività</div>
			</div>
			{events
				.filter((event) => event.typology === "activity") // Filtra solo le attività
				.map(
					(event, index) =>
						event.originalElement.status !== "COMPLETED" && (
							<div key={index} className="list-event">
								<div className="list-date">
									{moment(event.start).format(
										"dddd D MMMM YYYY - HH:mm"
									)}
								</div>
								<div className="list-title text-truncate">
									{event.title}
									{event.isRecurring && (
										<span className="recurring-badge">
											Ricorrente
										</span>
									)}
								</div>
							</div>
						)
				)}
		</div>
	);
};

export default function CalendarPage() {
	const router = useRouter();
	const [events, setEvents] = useState<CalendarEvent[]>([]);
	const [currentView, setCurrentView] = useState<"calendar" | "list">(
		"calendar"
	);
	const [calendarView, setCalendarView] = useState<View>("month");
	const [showModal, setShowModal] = useState(false);
	const [selectedCalendarEvent, setSelectedCalendarEvent] =
		useState<CalendarEvent | null>(null);
	const { dateTime } = useTime();
	const [currentDate, setCurrentDate] = useState(dateTime);

	const { data: pulledCalendar } = useSWR(
		"/api/calendar/getCalendar",
		fetchCalendar
	);

	useEffect(() => {
		if (pulledCalendar) {
			const newEvents = convertToCalendarEvents(
				pulledCalendar,
				currentDate
			);
			setEvents(newEvents);
		}
	}, [pulledCalendar, currentDate]);

	const handleSelectEvent = (event: CalendarEvent) => {
		if (event.typology === "projectActivity") {
			const projectActivityId = (event.originalElement as any).projectId;
			router.push("/projects/" + projectActivityId);
			return;
		}

		const selectedEvent: CalendarEvent = {
			...event
		};
		setSelectedCalendarEvent(selectedEvent);
		setShowModal(true);
	};

	return (
		<>
			<GlobalSideBar />
			<Container className="calendar-container">
				<CustomToolbar
					currentDate={currentDate}
					calendarView={calendarView}
					currentView={currentView}
					setCurrentDate={setCurrentDate}
					setCalendarView={setCalendarView}
					setCurrentView={setCurrentView}
				/>

				{currentView === "list" ? (
					<ListView events={events} />
				) : (
					<Calendar
						localizer={localizer}
						events={events}
						view={calendarView}
						date={currentDate}
						onNavigate={setCurrentDate}
						onView={setCalendarView}
						onSelectEvent={handleSelectEvent}
						startAccessor="start"
						endAccessor="end"
						className="custom-calendar"
						getNow={() => dateTime}
						components={{
							toolbar: () => null
						}}
						eventPropGetter={(event) => ({
							className: `event-${event.typology}${event.isRecurring ? " recurring" : ""}`
						})}
					/>
				)}

				{selectedCalendarEvent && (
					<GenericModifyModal
						key={selectedCalendarEvent.id}
						calendarEvent={selectedCalendarEvent}
						showModal={showModal}
						setShowModal={setShowModal}
					/>
				)}
			</Container>
		</>
	);
}
