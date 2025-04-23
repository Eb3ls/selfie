"use client";

import { CustomToolbar } from "@/app/calendar/CustomToolbar";
import { GenericModifyModal } from "@/app/calendar/GenericModifyModal";
import {
	CalendarResponse,
	convertToCalendarEvents
} from "@/app/calendar/calendarUtils/calendarFetch";
import { CalendarEvent } from "@/app/calendar/calendarUtils/calendarTypes";
import { GlobalSideBar } from "@/app/components/GlobalSideBar";
import { useTime } from "@/app/components/TimeContext";
import { generalFetcher } from "@/utils/fetch/fetch";
import moment from "moment-timezone";
import "moment/locale/it";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Calendar, View, momentLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Button, Container } from "react-bootstrap";
import useSWR from "swr";
import { ListView } from "./ListView";
import "./calendar.css";

const localizer = momentLocalizer(moment);
moment.locale("it");

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

	const [modalsCount, setModalsCount] = useState(0);

	const {
		data: pulledCalendar,
		error,
		mutate
	} = useSWR<CalendarResponse>("/api/calendar/getCalendar", generalFetcher);

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
		setModalsCount((prev) => prev + 1);
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
							Errore durante il caricamento
						</h1>
						<p className="text-muted">
							Controlla la tua connessione o riprova più tardi.
						</p>
						<Button href="/home" variant="primary" className="mt-3">
							Torna alla home
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
				<CustomToolbar
					currentDate={currentDate}
					calendarView={calendarView}
					currentView={currentView}
					setCurrentDate={setCurrentDate}
					setCalendarView={setCalendarView}
					setCurrentView={setCurrentView}
					mutate={mutate}
				/>

				{currentView === "list" ? (
					<ListView
						events={events}
						handleSelectEvent={handleSelectEvent}
					/>
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
						getNow={() => dateTime}
						components={{
							toolbar: () => null
						}}
						eventPropGetter={(event) => ({
							className: `bg-calendar-${event.typology}`
						})}
						className="flex-grow-1 overflow-auto"
					/>
				)}

				{selectedCalendarEvent && (
					<GenericModifyModal
						key={modalsCount}
						calendarEvent={selectedCalendarEvent}
						showModal={showModal}
						setShowModal={setShowModal}
						mutate={mutate}
					/>
				)}
			</Container>
		</div>
	);
}
