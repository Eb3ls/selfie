"use client";

import { AddActivityModal } from "@/app/calendar/AddActivityModal";
import { AddEventModal } from "@/app/calendar/AddEventModal";
import { AddSessionModal } from "@/app/calendar/AddSessionModal";
import { StringActivity, StringEvent, StringSession } from "@/utils/db/db";
import moment from "moment";
import { useEffect, useState } from "react";
import { Calendar, View, momentLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Button, Container } from "react-bootstrap";
import useSWR from "swr";
// Importa il file CSS per lo stile del calendario
import "./calendar.css";

const localizer = momentLocalizer(moment);

type CalendarEvent = {
	id: string;
	title: string;
	start: Date;
	end: Date;
};

interface CalendarResponse {
	activities: StringActivity[];
	events: StringEvent[];
	sessions: StringSession[];
}

async function fetcher(url: string) {
	const response = await fetch(url);
	if (!response.ok) {
		alert("Errore durante il fetch delle note!");
	}
	return response.json();
}

export default function CalendarPage() {
	const [events, setEvents] = useState<CalendarEvent[]>([]);

	// Fetch della lista di elementi
	const {
		data: raw_elements_list,
		error: error_elements_list,
		mutate: mutate
	} = useSWR("/api/calendar/getCalendar", fetcher, {
		// refreshInterval: 2000, // Ricarica i dati ogni 2 secondi
		revalidateOnFocus: false // Disabilita il refetch quando si torna alla finestra
	}) as { data: CalendarResponse; error: any; mutate: () => void };

	// Aggiorna events quando i dati vengono recuperati
	useEffect(() => {
		if (raw_elements_list) {
			// Trasformazione dei dati grezzi in eventi
			const pulledActivities = raw_elements_list.activities;
			const pulledEvents = raw_elements_list.events;
			const pulledSessions = raw_elements_list.sessions;

			const events: CalendarEvent[] = [];

			// Aggiungi le attività come eventi
			pulledActivities.forEach((activity: StringActivity) => {
				events.push({
					id: activity._id!,
					title: activity.summary,
					start: moment(activity.dtStart).toDate(),
					end: moment(activity.dtStart).toDate()
				});
			});

			// Aggiungi gli eventi come eventi
			pulledEvents.forEach((event: StringEvent) => {
				events.push({
					id: event._id!,
					title: event.summary,
					start: moment(event.dtStart).toDate(),
					end: moment(event.dtEnd).toDate()
				});
			});

			// Aggiungi le sessioni come eventi
			pulledSessions.forEach((session: StringSession) => {
				events.push({
					id: session._id!,
					title: session.summary,
					start: moment(session.dtStart).toDate(),
					end: moment(session.dtEnd).toDate()
				});
			});

			console.log("Raw elements list:", raw_elements_list);
			console.log("Eventi:", events);

			setEvents(events);
		}
	}, [raw_elements_list]);

	// Stato per la vista attuale (month, week, day)
	const [currentView, setCurrentView] = useState<View>("month");

	// Stato per la data corrente visualizzata nel calendario
	const [currentDate, setCurrentDate] = useState(new Date());

	// Funzione per gestire il cambiamento di vista
	function handleViewChange(newView: View) {
		setCurrentView(newView);
	}

	// Funzione per gestire la navigazione (Today, Back, Next)
	function handleNavigate(newDate: Date) {
		setCurrentDate(newDate); // Aggiorna la data corrente
	}

	// Funzione per gestire la selezione di un evento
	function handleSelectEvent(event: CalendarEvent) {
		console.log("Evento selezionato:", event);
		setCurrentDate(event.start); // Imposta la data corrente come la data di inizio dell'evento
		setCurrentView("day"); // Cambia la vista in "day"
		// Qui possiamo aggiungere un modale che mostra i dettagli dell'evento
	}

	return (
		<Container style={{ height: "80vh" }}>
			<h1 className="calendar-title">Calendario Eventi</h1>
			<p className="calendar-description">
				Gestisci i tuoi eventi quotidiani
			</p>
			<Calendar
				localizer={localizer}
				events={events}
				popup={true}
				startAccessor="start"
				endAccessor="end"
				views={["month", "week", "day"]}
				view={currentView} // Stato attuale della vista
				onView={handleViewChange} // Cambia la vista quando l'utente preme un bottone
				date={currentDate} // Imposta la data corrente
				onNavigate={handleNavigate} // Cambia la data quando l'utente preme i bottoni (Today, Back, Next)
				onSelectEvent={handleSelectEvent} // Gestisce la selezione di un evento
				className="custom-calendar" // Classe per lo stile
			/>
			<AddActivityModal>
				<Button>Aggiungi Attività</Button>
			</AddActivityModal>
			<AddEventModal>
				<Button>Aggiungi Evento</Button>
			</AddEventModal>
			<AddSessionModal>
				<Button>Aggiungi Sessione</Button>
			</AddSessionModal>
		</Container>
	);
}
