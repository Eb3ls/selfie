import { PomodoroSettings } from "@/utils/db/db";
import Link from "next/link";
import React from "react";
import {
	FaBook,
	FaCalendarAlt,
	FaCoffee,
	FaComments,
	FaRedoAlt,
	FaStickyNote
} from "react-icons/fa";
import { FaChartGantt } from "react-icons/fa6";
import {
	ReducedActivity,
	ReducedCalendar,
	ReducedChat,
	ReducedEvent,
	ReducedNote,
	ReducedProject,
	ReducedProjectActivity,
	ReducedSession
} from "./types";

function formatDate(dateString: string): string {
	const date = new Date(dateString);
	const day = date.getDate().toString().padStart(2, "0");
	const month = (date.getMonth() + 1).toString().padStart(2, "0");
	const year = date.getFullYear();
	const hours = date.getHours().toString().padStart(2, "0");
	const minutes = date.getMinutes().toString().padStart(2, "0");

	return `${day}/${month}/${year} ${hours}:${minutes}`;
}

export const NotePreviews = ({ notes }: { notes: ReducedNote[] }) => {
	if (notes.length === 0) {
		return (
			<div className="p-3 border-0 rounded mb-2 hover-shadow">
				<div className="text-center text-muted">
					<FaStickyNote size={24} className="mb-2" />
					<p className="mb-1">Non ci sono note disponibili</p>
					<small>Crea o partecipa ad una nota per iniziare</small>
				</div>
			</div>
		);
	}

	return (
		<div className="list-group">
			{notes.map((note) => (
				<div
					key={note._id}
					className="list-group-item list-group-item-action p-3 border-0 rounded mb-2 hover-shadow"
				>
					<div className="d-flex justify-content-between align-items-center">
						<h6 className="mb-1 text-truncate">{note.summary}</h6>
					</div>
					<div className="d-flex align-items-center text-truncate">
						{note.categories &&
							note.categories
								.split(",")
								.map((category, index) => (
									<span
										key={index}
										className="badge bg-primary me-1"
									>
										{category.trim()}
									</span>
								))}
					</div>
					<div className="d-flex justify-content-between align-items-center">
						<small className="text-muted text-truncate">
							<span className="fw-bold">Ultima modifica:</span>{" "}
							{formatDate(note.dtModified)}
						</small>
					</div>
					<Link
						href={`/notepad/${note._id}`}
						className="btn btn-primary btn-sm mt-2"
					>
						Apri nota
					</Link>
				</div>
			))}
		</div>
	);
};

export const ProjectPreviews = ({
	projects
}: {
	projects: ReducedProject[];
}) => {
	if (projects.length === 0) {
		return (
			<div className="p-3 border-0 rounded mb-2 hover-shadow">
				<div className="text-center text-muted">
					<FaChartGantt size={24} className="mb-2" />
					<p className="mb-1">Non ci sono progetti disponibili</p>
					<small>Crea o partecipa ad un progetto per iniziare</small>
				</div>
			</div>
		);
	}

	return (
		<div className="list-group">
			{projects.map((project) => (
				<div
					key={project._id}
					className="list-group-item list-group-item-action p-3 border-0 rounded mb-2 hover-shadow"
				>
					<div className="d-flex justify-content-between align-items-center">
						<h6 className="mb-1 text-truncate">
							{project.summary}
						</h6>
					</div>
					<div className="d-flex align-items-center gap-2">
						<Link
							href={`/projects/${project._id}`}
							className="btn btn-warning btn-sm mt-2"
						>
							Apri progetto
						</Link>
						<Link
							href={`/notepad/${project.noteId}`}
							className="btn btn-primary btn-sm mt-2"
						>
							Apri nota
						</Link>
					</div>
				</div>
			))}
		</div>
	);
};

export const ChatPreviews = ({ chats }: { chats: ReducedChat[] }) => {
	if (chats.length === 0) {
		return (
			<div className="p-3 border-0 rounded mb-2 hover-shadow">
				<div className="text-center text-muted">
					<FaComments size={24} className="mb-2" />
					<p className="mb-1">Non ci sono chat disponibili</p>
					<small>Inizia una nuova conversazione</small>
				</div>
			</div>
		);
	}

	return (
		<div className="list-group">
			{chats.map((chat) => (
				<div
					key={chat._id}
					className="list-group-item list-group-item-action p-3 border-0 rounded mb-2 hover-shadow"
				>
					<div className="d-flex justify-content-between align-items-center">
						<h6 className="mb-1 text-truncate">{chat.summary}</h6>
						<small className="text-muted text-nowrap">
							{chat.lastMessageAt
								? formatDate(chat.lastMessageAt)
								: ""}
						</small>
					</div>
					<div className="d-flex justify-content-between align-items-center">
						<small className="text-muted text-truncate">
							<span className="fw-bold">
								{chat.lastMessageOwner
									? chat.lastMessageOwner + ":"
									: ""}
							</span>{" "}
							{chat.lastMessage || "Nessun messaggio"}
						</small>
					</div>
				</div>
			))}
		</div>
	);
};

export const PomodoroPreview = ({
	pomodoro
}: {
	pomodoro: PomodoroSettings | undefined;
}) => (
	<div className="list-group">
		<div className="list-group-item list-group-item-action p-3 border-0 rounded mb-2 hover-shadow">
			<div className="d-flex align-items-center">
				<FaRedoAlt className="text-danger me-2" size={20} />
				<p className="mb-1 small text-truncate">
					Cicli: {pomodoro?.cycles || 4} cicli
				</p>
			</div>
		</div>
		<div className="list-group-item list-group-item-action p-3 border-0 rounded mb-2 hover-shadow">
			<div className="d-flex align-items-center">
				<FaBook className="text-primary me-2" size={20} />
				<p className="mb-1 small text-truncate">
					Tempo di studio: {pomodoro?.studyTime || 25} minuti
				</p>
			</div>
		</div>
		<div className="list-group-item list-group-item-action p-3 border-0 rounded mb-2 hover-shadow">
			<div className="d-flex align-items-center">
				<FaCoffee className="text-warning me-2" size={20} />
				<p className="mb-1 small text-truncate">
					Tempo di pausa: {pomodoro?.breakTime || 5} minuti
				</p>
			</div>
		</div>
	</div>
);

const CalendarItemPreview = ({
	item
}: {
	item:
		| ReducedActivity
		| ReducedEvent
		| ReducedProjectActivity
		| ReducedSession;
}) => (
	<div className="list-group-item list-group-item-action p-3 border-0 rounded mb-2 hover-shadow">
		<div className="d-flex justify-content-between align-items-center">
			<h6 className="mb-1 text-truncate">{item.summary}</h6>
			<small className="text-muted text-nowrap">
				{formatDate(item.data)}
			</small>
		</div>
		<p className="mb-1 small text-truncate">{item.description}</p>
		<div className="d-flex justify-content-between align-items-center">
			<small className="text-muted text-truncate">
				<span className="fw-bold">Da:</span> {item.ownerName}
			</small>
		</div>
	</div>
);

const CalendarItemListPreview = ({
	item,
	emptyString
}: {
	item:
		| ReducedActivity[]
		| ReducedEvent[]
		| ReducedProjectActivity[]
		| ReducedSession[];
	emptyString: string;
}) => {
	if (item.length === 0) {
		return (
			<div className="p-3 border-0 rounded mb-2 hover-shadow">
				<div className="text-center text-muted">
					<FaCalendarAlt size={24} className="mb-2" />
					<p className="mb-1">{emptyString}</p>
					<small>Aggiungi nuovi elementi al calendario</small>
				</div>
			</div>
		);
	}

	return (
		<div className="list-group">
			{item.map((activity, index) => (
				<CalendarItemPreview key={index} item={activity} />
			))}
		</div>
	);
};

export const CalendarPreviews = ({
	calendar
}: {
	calendar: ReducedCalendar;
}) => (
	<div>
		<p className="badge bg-primary mx-3">Attività</p>
		<CalendarItemListPreview
			item={calendar.activities}
			emptyString="Nessuna attività in programma"
		/>
		<p className="badge bg-warning mx-3">Eventi</p>
		<CalendarItemListPreview
			item={calendar.events}
			emptyString="Nessun evento in programma"
		/>
		<p className="badge bg-success mx-3">Sessioni</p>
		<CalendarItemListPreview
			item={calendar.sessions}
			emptyString="Nessuna sessione in programma"
		/>
		<p className="badge bg-info mx-3">Attività di progetto</p>
		<CalendarItemListPreview
			item={calendar.projectActivities}
			emptyString="Nessuna attività di progetto in programma"
		/>
	</div>
);
