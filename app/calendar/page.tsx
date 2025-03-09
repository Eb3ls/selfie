"use client";

import { AddActivityModal } from "@/app/calendar/AddModals/AddActivityModal";
import { AddEventModal } from "@/app/calendar/AddModals/AddEventModal";
import { AddSessionModal } from "@/app/calendar/AddModals/AddSessionModal";
import { ModifyActivityModal } from "@/app/calendar/ModifyModals/ModifyActivityModal";
import { ModifyEventModal } from "@/app/calendar/ModifyModals/ModifyEventModal";
import { ModifySessionModal } from "@/app/calendar/ModifyModals/ModifySessionModal";
import {
	StringActivity,
	StringEvent,
	StringProjectActivity,
	StringSession
} from "@/utils/db/db";
import moment from "moment";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Calendar, View, momentLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Container } from "react-bootstrap";
import { RRule, rrulestr } from "rrule";
import useSWR from "swr";
import { GlobalSideBar } from "../components/GlobalSideBar";
import "./calendar.css";

const localizer = momentLocalizer(moment);

type StringActivityFrontend = Omit<StringActivity, "userIdList"> & {
	usernameList: string[];
};

type StringProjectActivityFrontend = Omit<
	StringProjectActivity,
	"userIdList"
> & {
	usernameList: string[];
	projectId: string;
};

type StringEventFrontend = Omit<StringEvent, "userIdList"> & {
	usernameList: string[];
};

type CalendarEvent = {
	id: string;
	title: string;
	start: Date;
	end: Date;
	typology: "activity" | "event" | "session" | "projectActivity";
	originalEvent?:
		| StringEventFrontend
		| StringActivityFrontend
		| StringSession
		| StringProjectActivityFrontend;
	isRecurring?: boolean;
};

interface CalendarResponse {
	activities: StringActivityFrontend[];
	events: StringEventFrontend[];
	sessions: StringSession[];
	projectActivities: StringProjectActivityFrontend[];
}

async function fetcher(url: string) {
	const response = await fetch(url);
	if (!response.ok)
		throw new Error("Errore durante il fetch degli elementi!");
	return response.json();
}

function generateRecurringEvents(
	event: StringEventFrontend,
	range: { start: Date; end: Date }
) {
	const events: CalendarEvent[] = [];
	try {
		if (event.rrule) {
			const rule = rrulestr(event.rrule, {
				dtstart: new Date(event.dtStart),
				forceset: true
			});
			const dates = rule.between(range.start, range.end, true);
			dates.forEach((date) => {
				events.push({
					id: event._id!,
					title: event.summary,
					start: moment(date).toDate(),
					end: moment(date).endOf("day").toDate(),
					typology: "event",
					originalEvent: event,
					isRecurring: true
				});
			});
		}
	} catch (e) {
		console.error("Errore nel parsing della RRULE:", e);
	}
	return events;
}

function generateRecurringSessions(
	session: StringSession,
	range: { start: Date; end: Date }
) {
	const events: CalendarEvent[] = [];
	try {
		if (session.rrule) {
			const rule = rrulestr(session.rrule, {
				dtstart: new Date(session.dtStart),
				forceset: true
			});
			const dates = rule.between(range.start, range.end, true);
			dates.forEach((date) => {
				const originalStart = new Date(session.dtStart);
				const originalEnd = new Date(session.dtEnd);
				const duration =
					originalEnd.getTime() - originalStart.getTime();
				const start = new Date(date);
				const end = new Date(start.getTime() + duration);
				events.push({
					id: session._id!,
					title: session.summary,
					start,
					end,
					typology: "session",
					originalEvent: session,
					isRecurring: true
				});
			});
		}
	} catch (e) {
		console.error("Errore nel parsing della RRULE per la sessione:", e);
	}
	return events;
}

export default function CalendarPage() {
	const router = useRouter();
	const [events, setEvents] = useState<CalendarEvent[]>([]);
	const [rawEvents, setRawEvents] = useState<StringEventFrontend[]>([]);
	const [rawActivities, setRawActivities] = useState<
		StringActivityFrontend[]
	>([]);
	const [rawSessions, setRawSessions] = useState<StringSession[]>([]);
	const [rawProjectActivities, setRawProjectActivities] = useState<
		StringProjectActivityFrontend[]
	>([]);
	const [currentView, setCurrentView] = useState<View>("month");
	const [currentDate, setCurrentDate] = useState(new Date());
	const [range, setRange] = useState<{ start: Date; end: Date }>({
		start: moment().startOf("month").toDate(),
		end: moment().endOf("month").toDate()
	});
	const [showModal, setShowModal] = useState(false);
	const [selectedCalendarEvent, setSelectedCalendarEvent] =
		useState<CalendarEvent | null>(null);

	const { data: raw_elements_list } = useSWR<CalendarResponse>(
		"/api/calendar/getCalendar",
		fetcher
	);

	useEffect(() => {
		if (raw_elements_list) {
			const newEvents: CalendarEvent[] = [];

			// Aggiungi project activities
			raw_elements_list.projectActivities.forEach((projectActivity) => {
				newEvents.push({
					id: projectActivity._id!,
					title: projectActivity.summary,
					start: moment(projectActivity.due).toDate(),
					end: moment(projectActivity.due).toDate(),
					typology: "projectActivity"
				});
			});

			// Aggiungi attività normali
			raw_elements_list.activities.forEach((activity) => {
				newEvents.push({
					id: activity._id!,
					title: activity.summary,
					start: moment(activity.due).toDate(),
					end: moment(activity.due).toDate(),
					typology: "activity"
				});
			});

			// Gestione eventi e sessioni
			raw_elements_list.events.forEach((event) => {
				if (event.rrule) {
					newEvents.push(...generateRecurringEvents(event, range));
				} else {
					newEvents.push({
						id: event._id!,
						title: event.summary,
						start: moment(event.dtStart).toDate(),
						end: moment(event.dtEnd).toDate(),
						typology: "event",
						originalEvent: event
					});
				}
			});

			raw_elements_list.sessions.forEach((session) => {
				newEvents.push(...generateRecurringSessions(session, range));
			});

			setEvents(newEvents);
			setRawEvents(raw_elements_list.events);
			setRawActivities(raw_elements_list.activities);
			setRawSessions(raw_elements_list.sessions);
			setRawProjectActivities(raw_elements_list.projectActivities);
		}
	}, [raw_elements_list, range]);

	const handleSelectEvent = (event: CalendarEvent) => {
		if (event.typology === "projectActivity") {
			const projectActivity = rawProjectActivities.find(
				(pa) => pa._id === event.id
			);
			if (projectActivity) {
				router.push(`/projects/${projectActivity.projectId}`);
			}
		} else if (event.typology === "activity") {
			const activity = rawActivities.find((a) => a._id === event.id);
			if (activity) {
				setSelectedCalendarEvent({ ...event, originalEvent: activity });
				setShowModal(true);
			}
		} else if (event.typology === "event") {
			const originalEvent =
				event.originalEvent ||
				rawEvents.find((e) => e._id === event.id);
			if (originalEvent) {
				setSelectedCalendarEvent({
					...event,
					originalEvent: originalEvent as StringEventFrontend
				});
				setShowModal(true);
			}
		} else if (event.typology === "session") {
			const session = rawSessions.find((s) => s._id === event.id);
			if (session) {
				setSelectedCalendarEvent({ ...event, originalEvent: session });
				setShowModal(true);
			}
		}
	};

	const handleNavigate = (newDate: Date) => {
		setCurrentDate(newDate);
		updateRange(newDate, currentView);
	};

	const handleView = (newView: View) => {
		setCurrentView(newView);
		updateRange(currentDate, newView);
	};

	const updateRange = (date: Date, view: View) => {
		const startOf =
			view === "month" ? "month" : view === "week" ? "isoWeek" : "day";
		const start = moment(date).startOf(startOf).toDate();
		const end = moment(date).endOf(startOf).toDate();
		setRange({ start, end });
	};

	const CustomToolbar = (toolbarProps: any) => {
		const formattedDate =
			currentView === "month"
				? moment(currentDate).format("MMMM YYYY")
				: currentView === "week"
					? `${moment(range.start).format("D MMM")} - ${moment(range.end).format("D MMM YYYY")}`
					: moment(currentDate).format("D MMMM YYYY");

		return (
			<div className="rbc-toolbar">
				<div className="toolbar-left">
					<div className="toolbar-controls">
						<button
							onClick={() => toolbarProps.onNavigate("PREV")}
							className="nav-button"
						>
							‹
						</button>
						<span className="current-date">{formattedDate}</span>
						<button
							onClick={() => toolbarProps.onNavigate("NEXT")}
							className="nav-button"
						>
							›
						</button>
					</div>
					<select
						value={currentView}
						onChange={(e) => {
							toolbarProps.onView(e.target.value as View);
							handleView(e.target.value as View);
						}}
						className="view-select"
					>
						{["month", "week", "day"].map((view) => (
							<option key={view} value={view}>
								{view.charAt(0).toUpperCase() + view.slice(1)}
							</option>
						))}
					</select>
				</div>

				<div className="add-buttons-container">
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
				</div>
			</div>
		);
	};

	return (
		<>
			<GlobalSideBar />
			<Container className="calendar-container">
				<Calendar
					localizer={localizer}
					events={events}
					view={currentView}
					date={currentDate}
					onNavigate={handleNavigate}
					onView={handleView}
					onSelectEvent={handleSelectEvent}
					startAccessor="start"
					endAccessor="end"
					className="custom-calendar"
					components={{
						toolbar: CustomToolbar,
						month: {
							dateHeader: ({ date }) => {
								const isToday = moment(date).isSame(
									moment(),
									"day"
								);
								return (
									<div
										className={`date-cell ${isToday ? "today" : ""}`}
									>
										{moment(date).format("D")}
									</div>
								);
							}
						}
					}}
					eventPropGetter={(event) => ({
						className: `event-${event.typology}${event.isRecurring ? " recurring" : ""}`
					})}
				/>

				{/* Modali solo per attività/eventi/sessioni */}
				{selectedCalendarEvent?.typology === "activity" && (
					<ModifyActivityModal
						show={showModal}
						setShow={setShowModal}
						activity={
							rawActivities.find(
								(a) => a._id === selectedCalendarEvent.id
							) as StringActivityFrontend
						}
					/>
				)}

				{selectedCalendarEvent?.typology === "event" && (
					<ModifyEventModal
						show={showModal}
						setShow={setShowModal}
						event={
							selectedCalendarEvent.originalEvent as StringEventFrontend
						}
					/>
				)}

				{selectedCalendarEvent?.typology === "session" && (
					<ModifySessionModal
						show={showModal}
						setShow={setShowModal}
						session={
							rawSessions.find(
								(s) => s._id === selectedCalendarEvent.id
							) as StringSession
						}
					/>
				)}
			</Container>
		</>
	);
}
