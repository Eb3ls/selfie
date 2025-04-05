"use client";

import { convertToCalendarEvents } from "@/app/calendar/calendarUtils/calendarFetch";
import {
	CalendarEvent,
	StringEventFrontend
} from "@/app/calendar/calendarUtils/calendarTypes";
import { GlobalSideBar } from "@/app/components/GlobalSideBar";
import { useTime } from "@/app/components/TimeContext";
import moment from "moment";
import "moment/locale/it";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Calendar, View, momentLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Container } from "react-bootstrap";
import useSWR from "swr";
import "../calendar.css";
import { LittleCustomToolbar } from "./LittleCustomToolbar";
import { ViewEventModal } from "./ViewEventModal";

const localizer = momentLocalizer(moment);
moment.locale("it");

type NewCalendarEvent = Omit<CalendarEvent, "originalElement"> & {
	originalElement: StringEventFrontend;
};

async function fetchCalendarID(url: string) {
	const response = await fetch(url);
	if (!response.ok)
		throw new Error("Errore durante il fetch degli elementi!");
	return response.json();
}

export default function CalendarIDPage() {
	const params = useParams();
	const resourceId = params.id;

	const [events, setEvents] = useState<NewCalendarEvent[]>([]);
	const [calendarView, setCalendarView] = useState<View>("month");
	const [showModal, setShowModal] = useState(false);
	const [selectedCalendarEvent, setSelectedCalendarEvent] =
		useState<NewCalendarEvent | null>(null);

	const { dateTime } = useTime();
	const [currentDate, setCurrentDate] = useState(dateTime);

	const { data: pulledCalendar } = useSWR(
		"/api/calendar/getCalendar/" + resourceId,
		fetchCalendarID
	);

	useEffect(() => {
		if (pulledCalendar) {
			pulledCalendar.activities = [];
			pulledCalendar.sessions = [];
			pulledCalendar.projectActivities = [];
			const newEvents = convertToCalendarEvents(
				pulledCalendar,
				currentDate
			) as NewCalendarEvent[]; // Assumiamo che l'API restituisca solo StringEvent
			setEvents(newEvents);
		}
	}, [pulledCalendar, currentDate]);

	const handleSelectEvent = (event: NewCalendarEvent) => {
		const selectedEvent: NewCalendarEvent = {
			...event
		};
		setSelectedCalendarEvent(selectedEvent);
		setShowModal(true);
	};

	return (
		<>
			<GlobalSideBar />
			<Container className="calendar-container">
				<LittleCustomToolbar
					currentDate={currentDate}
					calendarView={calendarView}
					setCurrentDate={setCurrentDate}
					setCalendarView={setCalendarView}
				/>

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

				{selectedCalendarEvent && (
					<ViewEventModal
						key={selectedCalendarEvent.id}
						event={selectedCalendarEvent.originalElement}
						show={showModal}
						resourceId={resourceId}
						setShow={setShowModal}
					/>
				)}
			</Container>
		</>
	);
}
