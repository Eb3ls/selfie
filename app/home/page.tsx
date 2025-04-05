"use client";

import { PomodoroSettings } from "@/utils/db/db";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Badge, Button, Container, Stack } from "react-bootstrap";
import {
	FaBook,
	FaCalendarAlt,
	FaCoffee,
	FaRedoAlt,
	FaStickyNote
} from "react-icons/fa";
import { toast } from "react-toastify";
import { GlobalSideBar } from "../components/GlobalSideBar";
import { useUser } from "../components/UserContext";
import "./home.css";

// Tipi esistenti per Note, Progetti e Chat
interface ReducedNote {
	_id: string;
	summary: string;
	categories: string;
	dtModified: string;
}

interface ReducedProject {
	_id: string;
	summary: string;
	noteId: string;
}

interface ReducedChat {
	_id: string;
	summary: string;
	lastMessage: string;
	lastMessageOwner: string;
	lastMessageAt: string;
}

// Nuovi tipi per la preview del Calendario
interface ReducedActivity {
	_id: string;
	summary: string;
	description: string;
	data: string; // formato ISO
	ownerName: string;
}

interface ReducedProjectActivity {
	_id: string;
	summary: string;
	description: string;
	data: string; // formato ISO
	ownerName: string;
}

interface ReducedEvent {
	_id: string;
	summary: string;
	description: string;
	data: string; // occorrenza (se ricorrente) oppure dtStart
	ownerName: string;
}

interface ReducedSession {
	_id: string;
	summary: string;
	description: string;
	data: string; // occorrenza calcolata dalla rrule
	ownerName: string;
}

interface ReducedCalendar {
	activities: ReducedActivity[];
	projectActivities: ReducedProjectActivity[];
	events: ReducedEvent[];
	sessions: ReducedSession[];
}

// Risposta finale che ora include anche il ReducedCalendar
interface PreviewsResponse {
	notes: ReducedNote[];
	projects: ReducedProject[];
	chats: ReducedChat[];
	calendar: ReducedCalendar;
}

// Funzione per formattare le date in un formato leggibile
function formatDate(dateString: string): string {
	const date = new Date(dateString);
	const day = date.getDate().toString().padStart(2, "0");
	const month = (date.getMonth() + 1).toString().padStart(2, "0");
	const year = date.getFullYear();
	const hours = date.getHours().toString().padStart(2, "0");
	const minutes = date.getMinutes().toString().padStart(2, "0");

	return `${day}/${month}/${year} ${hours}:${minutes}`;
}

function PreviewList({
	items,
	type
}: {
	items: any[];
	type: "notepad" | "projects" | "chat";
}) {
	const router = useRouter();

	return (
		<Stack gap={3}>
			{items?.map((item, index) => (
				<div
					key={index}
					className="preview-item"
					onClick={() =>
						type === "chat"
							? router.push("/chat")
							: router.push(`/${type}/${item._id}`)
					}
				>
					<div className="preview-header">
						<div
							className={`preview-icon bg-${type === "chat" ? "success" : type === "notepad" ? "primary" : "warning"}-subtle`}
						>
							{type === "chat" ? (
								<FaStickyNote
									className={`text-${type === "chat" ? "success" : type === "notepad" ? "primary" : "warning"}`}
								/>
							) : type === "notepad" ? (
								<FaBook className="text-primary" />
							) : (
								<FaStickyNote className="text-warning" />
							)}
						</div>
						<div className="flex-grow-1">
							<h6 className="preview-title">{item.summary}</h6>
							{type === "chat" && (
								<div className="preview-meta">
									<div className="mb-1">
										{item.lastMessage}
									</div>
									<span className="preview-badge bg-light text-dark">
										{item.lastMessageOwner}
									</span>
									<small className="ms-2">
										{formatDate(item.lastMessageAt)}
									</small>
								</div>
							)}
							{type === "notepad" && (
								<div className="preview-meta">
									<div className="d-flex flex-wrap gap-2 mb-1">
										{item.categories
											.split(",")
											.map((cat: string, i: number) => (
												<span
													key={i}
													className="preview-badge bg-primary-subtle text-primary"
												>
													{cat.trim()}
												</span>
											))}
									</div>
									<small>{formatDate(item.dtModified)}</small>
								</div>
							)}
							{type === "projects" && item.noteId && (
								<Button
									variant="none"
									className="p-0 mt-1"
									onClick={(e) => {
										e.stopPropagation();
										router.push(`/notepad/${item.noteId}`);
									}}
								>
									<small className="text-warning">
										Vedi nota collegata
									</small>
								</Button>
							)}
						</div>
					</div>
				</div>
			))}
		</Stack>
	);
}

// Nuovo componente per la preview del Calendario
function PreviewCalendar({ calendar }: { calendar: ReducedCalendar }) {
	// Funzione per generare il layout degli elementi con badge colorati
	const renderItems = (
		title: string,
		items: (
			| ReducedActivity
			| ReducedEvent
			| ReducedSession
			| ReducedProjectActivity
		)[],
		badgeColor: string
	) => (
		<div className="mb-3">
			<h6 className="fw-bold">
				<Badge bg={badgeColor} className="me-2">
					{title}
				</Badge>
			</h6>
			{items && items.length === 0 ? (
				<p className="text-muted ms-4">
					Nessun {title.toLowerCase()} imminente
				</p>
			) : (
				<Stack gap={2} className="ms-4">
					{items &&
						items.map((item, index) => (
							<div
								key={index}
								className="border rounded-3 p-2"
								style={{ backgroundColor: "#fff" }}
							>
								<h6 className="mb-1">{item.summary}</h6>
								<p
									className="mb-1 text-muted"
									style={{ fontSize: "0.9rem" }}
								>
									{item.description}
								</p>
								<p
									className="mb-0 text-secondary"
									style={{ fontSize: "0.8rem" }}
								>
									{formatDate(item.data)} - {item.ownerName}
								</p>
							</div>
						))}
				</Stack>
			)}
		</div>
	);

	return (
		<div>
			{renderItems(
				"Attività",
				calendar && calendar.activities,
				"primary"
			)}
			{renderItems("Eventi", calendar && calendar.events, "warning")}
			{renderItems(
				"Sessione Pomodoro",
				calendar && calendar.sessions,
				"success"
			)}
			{renderItems(
				"Attività Progetti",
				calendar && calendar.projectActivities,
				"info"
			)}
		</div>
	);
}

// Nuovo componente per la preview del Pomodoro
function PreviewPomodoro({ pomodoro }: { pomodoro: PomodoroSettings }) {
	return (
		<Stack gap={3}>
			<div className="d-flex align-items-center">
				<FaRedoAlt className="text-danger me-2" size={20} />
				<div>
					<h6 className="mb-0 fw-bold">Cicli</h6>
					<small className="text-muted">{pomodoro.cycles}</small>
				</div>
			</div>
			<div className="d-flex align-items-center">
				<FaBook className="text-primary me-2" size={20} />
				<div>
					<h6 className="mb-0 fw-bold">Tempo di studio</h6>
					<small className="text-muted">
						{pomodoro.studyTime} minuti
					</small>
				</div>
			</div>
			<div className="d-flex align-items-center">
				<FaCoffee className="text-warning me-2" size={20} />
				<div>
					<h6 className="mb-0 fw-bold">Tempo di pausa</h6>
					<small className="text-muted">
						{pomodoro.breakTime} minuti
					</small>
				</div>
			</div>
		</Stack>
	);
}

function WelcomeSection({ userName }: { userName: string }) {
	return (
		<div className="welcome-section text-center py-4 mb-4">
			<h1 className="display-4 mb-3 fw-bold text-primary">
				Benvenuto in Selfie{userName ? `, ${userName}` : ""}! 👋
			</h1>
			<p className="lead mb-4">
				Il tuo spazio personale per organizzare studio, progetti e molto
				altro. Inizia ad esplorare le funzionalità che abbiamo creato
				per te!
			</p>
		</div>
	);
}

function ModernCard({
	title,
	icon,
	description,
	content,
	link,
	accentColor = "primary"
}: {
	title: string;
	icon: React.ReactNode;
	description: string;
	content: React.ReactNode;
	link: string;
	accentColor?: string;
}) {
	const router = useRouter();

	return (
		<div className="modern-card bg-white rounded-4 shadow-lg border-0">
			<div className="card-header p-4 position-relative">
				<div
					className="accent-bar"
					style={{
						background: `var(--bs-${accentColor})`,
						position: "absolute",
						top: 0,
						left: "50%",
						transform: "translateX(-50%)",
						height: "4px",
						width: "60%",
						borderRadius: "0 0 8px 8px"
					}}
				/>
				<div className="d-flex align-items-center gap-3 mb-3">
					<div className={`icon-wrapper text-${accentColor}`}>
						{icon}
					</div>
					<div className="flex-grow-1">
						<h3 className="h4 mb-1">{title}</h3>
						<p className="text-muted mb-0 small">{description}</p>
					</div>
				</div>
				<div className="mt-3">
					<Button
						variant={accentColor}
						size="sm"
						className="rounded-pill px-4 py-2"
						onClick={() => router.push(link)}
					>
						Apri {title}
					</Button>
				</div>
			</div>

			<div className="content-scroll px-4 py-2 mb-2">{content}</div>
		</div>
	);
}

export default function Home() {
	const [previews, setPreviews] = useState<PreviewsResponse | null>(null);
	const { user } = useUser();

	useEffect(() => {
		async function fetchPreviews() {
			try {
				const response = await fetch("/api/preview");

				if (!response.ok) {
					throw new Error();
				}

				const data: PreviewsResponse = await response.json();
				setPreviews(data);
			} catch (error) {
				toast.error("Errore durante il caricamento dei dati");
			}
		}

		fetchPreviews();
	}, []);

	return (
		<main className="bg-light min-vh-100">
			<GlobalSideBar />
			<Container fluid className="px-4 py-5">
				<WelcomeSection userName={user?.firstName || ""} />

				<div className="dashboard-grid">
					<ModernCard
						title="Chat"
						icon={<FaStickyNote size={24} />}
						description="Messaggia con i tuoi colleghi"
						content={
							previews && (
								<PreviewList
									items={previews.chats}
									type="chat"
								/>
							)
						}
						link="/chat"
						accentColor="success"
					/>
					<ModernCard
						title="Calendario"
						icon={<FaCalendarAlt size={24} />}
						description="Organizza i tuoi impegni"
						content={
							previews && (
								<PreviewCalendar calendar={previews.calendar} />
							)
						}
						link="/calendar"
						accentColor="info"
					/>
					<div className="right-column">
						<ModernCard
							title="Note"
							icon={<FaBook size={24} />}
							description="Gestisci i tuoi appunti"
							content={
								previews && (
									<PreviewList
										items={previews.notes}
										type="notepad"
									/>
								)
							}
							link="/notepad"
							accentColor="primary"
						/>
						<ModernCard
							title="Progetti"
							icon={<FaStickyNote size={24} />}
							description="Coordina le tue attività"
							content={
								previews && (
									<PreviewList
										items={previews.projects}
										type="projects"
									/>
								)
							}
							link="/projects"
							accentColor="warning"
						/>
						<ModernCard
							title="Pomodoro"
							icon={<FaCoffee size={24} />}
							description="Ottimizza il tuo studio"
							content={
								user?.pomodoro && (
									<PreviewPomodoro pomodoro={user.pomodoro} />
								)
							}
							link="/pomodoro"
							accentColor="danger"
						/>
					</div>
				</div>
			</Container>
		</main>
	);
}
