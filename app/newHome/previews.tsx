import { PomodoroSettings } from "@/utils/db/db";
import Link from "next/link";
import React from "react";
import { FaBook, FaCoffee, FaRedoAlt } from "react-icons/fa";
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

export const NotePreviews = ({ notes }: { notes: ReducedNote[] }) => (
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
						note.categories.split(",").map((category, index) => (
							<span key={index} className="badge bg-primary me-1">
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

export const ProjectPreviews = ({
	projects
}: {
	projects: ReducedProject[];
}) => (
	<div className="list-group">
		{projects.map((project) => (
			<div
				key={project._id}
				className="list-group-item list-group-item-action p-3 border-0 rounded mb-2 hover-shadow"
			>
				<div className="d-flex justify-content-between align-items-center">
					<h6 className="mb-1 text-truncate">{project.summary}</h6>
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

export const ChatPreviews = ({ chats }: { chats: ReducedChat[] }) => (
	<div className="list-group">
		{chats.map((chat) => (
			<div
				key={chat._id}
				className="list-group-item list-group-item-action p-3 border-0 rounded mb-2 hover-shadow"
			>
				<div className="d-flex justify-content-between align-items-center">
					<h6 className="mb-1 text-truncate">{chat.summary}</h6>
					<small className="text-muted text-nowrap">
						{formatDate(chat.lastMessageAt)}
					</small>
				</div>
				<div className="d-flex justify-content-between align-items-center">
					<small className="text-muted text-truncate">
						<span className="fw-bold">
							{chat.lastMessageOwner}:
						</span>{" "}
						{chat.lastMessage}
					</small>
				</div>
			</div>
		))}
	</div>
);

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

export const CalendarPreviews = ({
	calendar
}: {
	calendar: ReducedCalendar;
}) => (
	<div className="list-group">
		{[
			...calendar.activities,
			...calendar.events,
			...calendar.projectActivities,
			...calendar.sessions
		]
			.sort(
				(a, b) =>
					new Date(a.data).getTime() - new Date(b.data).getTime()
			)
			.map((item, index) => (
				<CalendarItemPreview key={index} item={item} />
			))}
	</div>
);
