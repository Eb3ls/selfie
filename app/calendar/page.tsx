"use client";

import { AddActivityModal } from "@/app/calendar/AddModals/AddActivityModal";
import { AddEventModal } from "@/app/calendar/AddModals/AddEventModal";
import { AddSessionModal } from "@/app/calendar/AddModals/AddSessionModal";
import { ModifyActivityModal } from "@/app/calendar/ModifyModals/ModifyActivityModal";
import { ModifyEventModal } from "@/app/calendar/ModifyModals/ModifyEventModal";
import { ModifySessionModal } from "@/app/calendar/ModifyModals/ModifySessionModal";
import { StringActivity, StringEvent, StringSession } from "@/utils/db/db";
import moment from "moment";
import { useEffect, useState } from "react";
import { Calendar, View, momentLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Button, Container } from "react-bootstrap";
import { RRule, rrulestr } from "rrule";
import useSWR from "swr";
import { GlobalSideBar } from "../components/GlobalSideBar";
import "./calendar.css";

const localizer = momentLocalizer(moment);

type CalendarEvent = {
	id: string;
	title: string;
	start: Date;
	end: Date;
	typology: "activity" | "event" | "session";
	originalEvent?: StringEvent | StringActivity | StringSession; // Usa un tipo union
	isRecurring?: boolean;
};

interface CalendarResponse {
	activities: StringActivity[];
	events: StringEvent[];
	sessions: StringSession[];
}

async function fetcher(url: string) {
	const response = await fetch(url);
	if (!response.ok)
		throw new Error("Errore durante il fetch degli elementi!");
	return response.json();
}

function generateRecurringEvents(
	event: StringEvent,
	range: { start: Date; end: Date }
): CalendarEvent[] {
	const events: CalendarEvent[] = [];

	try {
		if (event.rrule) {
			const rule = rrulestr(event.rrule, {
				dtstart: new Date(event.dtStart),
				forceset: true
			});

			const dates = rule.between(range.start, range.end, true);

			dates.forEach((date) => {
				const start = moment(date).toDate();
				// Imposta l'evento ricorrente per durare solo un giorno
				const end = moment(date).endOf("day").toDate(); // L'evento dura fino a mezzanotte

				events.push({
					id: event._id!,
					title: event.summary,
					start,
					end,
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

export default function CalendarPage() {
	const [events, setEvents] = useState<CalendarEvent[]>([]);
	const [rawEvents, setRawEvents] = useState<StringEvent[]>([]);
	const [rawActivities, setRawActivities] = useState<StringActivity[]>([]);
	const [rawSessions, setRawSessions] = useState<StringSession[]>([]);
	const [currentView, setCurrentView] = useState<View>("month"); // Usa il tipo View dalla libreria
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

			// Gestione attività
			raw_elements_list.activities.forEach((activity) => {
				newEvents.push({
					id: activity._id!,
					title: activity.summary,
					start: moment(activity.due).toDate(),
					end: moment(activity.due).toDate(),
					typology: "activity"
				});
			});

			// Gestione eventi
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

			// Gestione sessioni
			raw_elements_list.sessions.forEach((session) => {
				newEvents.push({
					id: session._id!,
					title: session.summary,
					start: moment(session.dtStart).toDate(),
					end: moment(session.dtEnd).toDate(),
					typology: "session"
				});
			});

			setEvents(newEvents);
			setRawEvents(raw_elements_list.events);
			setRawActivities(raw_elements_list.activities);
			setRawSessions(raw_elements_list.sessions);
		}
	}, [raw_elements_list, range]);

	const handleSelectEvent = (event: CalendarEvent) => {
		console.log("Event selected:", event);
		if (event.typology === "activity") {
			console.log("Raw Activities:", rawActivities);
			const activity = rawActivities.find((a) => a._id === event.id);
			if (activity) {
				setSelectedCalendarEvent({
					...event,
					originalEvent: activity // Passa l'attività come originalEvent
				});
				setShowModal(true);
			} else {
				alert("Attività non trovata!");
			}
		} else if (event.typology === "event") {
			console.log("Raw Events:", rawEvents);
			const originalEvent =
				event.originalEvent ||
				rawEvents.find((e) => e._id === event.id);
			if (originalEvent) {
				setSelectedCalendarEvent({
					...event,
					originalEvent: originalEvent as StringEvent
				});
				setShowModal(true);
			} else {
				alert("Evento non trovato!");
			}
		} else if (event.typology === "session") {
			console.log("Raw Sessions:", rawSessions);
			const session = rawSessions.find((s) => s._id === event.id);
			if (session) {
				setSelectedCalendarEvent({
					...event,
					originalEvent: session // Passa la sessione come originalEvent
				});
				setShowModal(true);
			} else {
				alert("Sessione non trovata!");
			}
		}
	};

	const handleNavigate = (newDate: Date) => {
		setCurrentDate(newDate);
		updateRange(newDate, currentView);
	};

	const handleView = (newView: View) => {
		// Usa il tipo View dalla libreria
		setCurrentView(newView);
		updateRange(currentDate, newView);
	};

	const viewToStartOfMap: { [key in View]: moment.unitOfTime.StartOf } = {
		day: "day",
		week: "isoWeek",
		month: "month",
		work_week: null,
		agenda: null
	};

	const updateRange = (date: Date, view: View) => {
		const startOf = viewToStartOfMap[view];
		const start = moment(date).startOf(startOf).toDate();
		const end = moment(date).endOf(startOf).toDate();
		setRange({ start, end });
	};

	return (
		<>
			<GlobalSideBar />
			<Container style={{ height: "90vh", paddingTop: "20px" }}>
				<Calendar
					localizer={localizer}
					events={events}
					view={currentView}
					date={currentDate}
					onNavigate={handleNavigate}
					onView={handleView} // Passa la funzione corretta
					onSelectEvent={handleSelectEvent}
					startAccessor="start"
					endAccessor="end"
					style={{ height: "100%" }}
					eventPropGetter={(event) => ({
						style: {
							backgroundColor:
								event.typology === "activity"
									? "#ffcccb"
									: event.typology === "event"
										? "#90EE90"
										: "#87CEEB",
							borderRadius: "4px",
							padding: "2px 5px"
						}
					})}
					components={{
						month: {
							dateHeader: ({ date }) => (
								<div style={{ textAlign: "center" }}>
									{moment(date).format("D")}
								</div>
							)
						}
					}}
				/>

				{/* Bottoni e modali */}
				<div style={{ marginTop: "20px" }}>
					<AddActivityModal>
						<Button variant="outline-primary" className="me-2">
							Aggiungi Attività
						</Button>
					</AddActivityModal>
					<AddEventModal>
						<Button variant="outline-success" className="me-2">
							Aggiungi Evento
						</Button>
					</AddEventModal>
					<AddSessionModal>
						<Button variant="outline-info">
							Aggiungi Sessione
						</Button>
					</AddSessionModal>
				</div>

				{/* Modali di modifica */}
				{selectedCalendarEvent?.typology === "activity" && (
					<ModifyActivityModal
						show={showModal}
						setShow={setShowModal}
						activity={
							rawActivities.find(
								(a) => a._id === selectedCalendarEvent.id
							) as StringActivity
						}
					/>
				)}

				{selectedCalendarEvent?.typology === "event" && (
					<ModifyEventModal
						show={showModal}
						setShow={setShowModal}
						event={
							selectedCalendarEvent.originalEvent as StringEvent
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

				{/* Modali di modifica */}
				{selectedCalendarEvent?.typology === "activity" && (
					<ModifyActivityModal
						show={showModal}
						setShow={setShowModal}
						activity={
							rawActivities.find(
								(a) => a._id === selectedCalendarEvent.id
							) as StringActivity
						}
					/>
				)}

				{selectedCalendarEvent?.typology === "event" && (
					<ModifyEventModal
						show={showModal}
						setShow={setShowModal}
						event={
							selectedCalendarEvent.originalEvent as StringEvent
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
