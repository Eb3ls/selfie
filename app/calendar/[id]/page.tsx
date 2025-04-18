"use client";

import {
	CalendarResponse,
	convertToCalendarEvents
} from "@/app/calendar/calendarUtils/calendarFetch";
import {
	CalendarEvent,
	StringEventFrontend
} from "@/app/calendar/calendarUtils/calendarTypes";
import { GlobalSideBar } from "@/app/components/GlobalSideBar";
import { useTime } from "@/app/components/TimeContext";
import { generalFetcher } from "@/utils/fetch/fetch";
import moment from "moment-timezone";
import "moment/locale/it";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Calendar, View, momentLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Button, Container } from "react-bootstrap";
import useSWR from "swr";
import "../calendar.css";
import { LittleCustomToolbar } from "./LittleCustomToolbar";
import { ViewEventModal } from "./ViewEventModal";

const localizer = momentLocalizer(moment);
moment.locale("it");

type NewCalendarEvent = Omit<CalendarEvent, "originalElement"> & {
	originalElement: StringEventFrontend;
};

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

	const {
		data: pulledCalendar,
		error,
		mutate
	} = useSWR<CalendarResponse>(
		"/api/calendar/getCalendar/" + resourceId,
		generalFetcher
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

	if (error) {
		return (
			<div className="dvh-100 overflow-auto bg-light">
				<GlobalSideBar />
				<Container>
					<div className="d-flex flex-column align-items-center justify-content-center h-100 mt-3">
						<h1 className="display-4 text-danger mb-3">
							Calendario non trovato
						</h1>
						<p className="text-muted">
							Il calendario che stai cercando di visualizzare non
							è accessibile o non esiste.
						</p>
						<Button
							href="/calendar"
							variant="primary"
							className="mt-3"
						>
							Torna al calendario
						</Button>
					</div>
				</Container>
			</div>
		);
	}

	if (!pulledCalendar) {
		return (
			<div className="dvh-100 overflow-auto bg-light">
				<GlobalSideBar />
				<Container>
					<div className="d-flex flex-column align-items-center justify-content-center h-100 mt-3">
						<div
							className="spinner-border text-primary mb-3"
							role="status"
						>
							<span className="visually-hidden">
								Caricamento...
							</span>
						</div>
						<h2 className="h4 text-muted">Caricamento...</h2>
					</div>
				</Container>
			</div>
		);
	}

	return (
		<div className="dvh-100 overflow-y-auto bg-light d-flex flex-column">
			<GlobalSideBar />
			<Container
				className="mt-2 d-flex flex-column gap-3 flex-grow-1 mb-3 mb-lg-5"
				style={{ minHeight: 0 }}
			>
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
					getNow={() => dateTime}
					components={{
						toolbar: () => null
					}}
					eventPropGetter={(event) => ({
						className: `bg-calendar-${event.typology}`
					})}
				/>

				{selectedCalendarEvent && (
					<ViewEventModal
						key={selectedCalendarEvent.id}
						event={selectedCalendarEvent.originalElement}
						show={showModal}
						resourceId={resourceId}
						setShow={setShowModal}
						mutate={mutate}
					/>
				)}
			</Container>
		</div>
	);
}
