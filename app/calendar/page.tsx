"use client";

import moment from "moment";
import { useState } from "react";
import { Calendar, View, momentLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Container } from "react-bootstrap";
// Importa il file CSS per lo stile del calendario
import "./calendar.css";

const localizer = momentLocalizer(moment);

type Event = {
	id: number;
	title: string;
	start: Date;
	end: Date;
};

export default function CalendarPage() {
	const [myEvents, setEvents] = useState<Event[]>([
		{
			id: 1,
			title: "Passeggiata al parco",
			start: moment("2024-10-03T09:00:00").toDate(),
			end: moment("2024-10-03T10:00:00").toDate()
		},
		{
			id: 2,
			title: "Caffè con un amico",
			start: moment("2024-10-03T10:30:00").toDate(),
			end: moment("2024-10-03T11:00:00").toDate()
		},
		{
			id: 3,
			title: "Spesa al supermercato",
			start: moment("2024-10-04T14:00:00").toDate(),
			end: moment("2024-10-04T15:00:00").toDate()
		},
		{
			id: 4,
			title: "Pranzo con i colleghi",
			start: moment("2024-10-04T12:00:00").toDate(),
			end: moment("2024-10-04T13:00:00").toDate()
		},
		{
			id: 5,
			title: "Allenamento in palestra",
			start: moment("2024-10-05T09:00:00").toDate(),
			end: moment("2024-10-05T10:30:00").toDate()
		},
		{
			id: 6,
			title: "Chiamata con la famiglia",
			start: moment("2024-10-05T11:00:00").toDate(),
			end: moment("2024-10-05T12:00:00").toDate()
		},
		{
			id: 7,
			title: "Sessione di yoga",
			start: moment("2024-10-06T14:00:00").toDate(),
			end: moment("2024-10-06T15:00:00").toDate()
		},
		{
			id: 8,
			title: "Lettura di un libro",
			start: moment("2024-10-07T09:00:00").toDate(),
			end: moment("2024-10-07T10:00:00").toDate()
		},
		{
			id: 9,
			title: "Corso di cucina",
			start: moment("2024-10-07T11:00:00").toDate(),
			end: moment("2024-10-07T13:00:00").toDate()
		},
		{
			id: 10,
			title: "Organizzazione della settimana",
			start: moment("2024-10-08T15:00:00").toDate(),
			end: moment("2024-10-08T16:00:00").toDate()
		},
		{
			id: 11,
			title: "Videochiamata con un amico",
			start: moment("2024-10-08T16:30:00").toDate(),
			end: moment("2024-10-08T17:00:00").toDate()
		},
		{
			id: 12,
			title: "Visita al museo",
			start: moment("2024-10-09T10:00:00").toDate(),
			end: moment("2024-10-09T11:00:00").toDate()
		},
		{
			id: 13,
			title: "Incontro con il gruppo di lettura",
			start: moment("2024-10-09T14:00:00").toDate(),
			end: moment("2024-10-09T15:00:00").toDate()
		},
		{
			id: 14,
			title: "Incontro con il gruppo di scienza",
			start: moment("2024-10-09T14:00:00").toDate(),
			end: moment("2024-10-09T15:00:00").toDate()
		}
	]);

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
	function handleSelectEvent(event: Event) {
		console.log("Evento selezionato:", event);
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
				events={myEvents}
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
		</Container>
	);
}
