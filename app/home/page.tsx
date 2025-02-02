"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
	Badge,
	Button,
	Card,
	Col,
	Container,
	Row,
	Stack
} from "react-bootstrap";
import {
	FaBook,
	FaCoffee,
	FaRedoAlt,
	FaRegClock,
	FaStickyNote
} from "react-icons/fa";
import { GlobalSideBar } from "../components/GlobalSideBar";
import { useUser } from "../components/UserContext";

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

function PreviewBox({
	title,
	content,
	link
}: {
	title: string;
	content: React.ReactNode;
	link: string;
}) {
	let vh = 50;
	if (title === "Chat") {
		vh = 92;
	}

	return (
		<Card
			className="shadow-lg mt-1 mb-3 rounded-4 border-0"
			style={{
				height: `calc(${vh}vh - 12vh)`,
				background: "linear-gradient(145deg, #ffffff, #f8f9fa)",
				transition: "transform 0.2s, box-shadow 0.2s"
			}}
			onMouseEnter={(e) => {
				e.currentTarget.style.transform = "translateY(-5px)";
				e.currentTarget.style.boxShadow =
					"0 8px 16px rgba(0, 0, 0, 0.2)";
			}}
			onMouseLeave={(e) => {
				e.currentTarget.style.transform = "translateY(0)";
				e.currentTarget.style.boxShadow =
					"0 4px 8px rgba(0, 0, 0, 0.1)";
			}}
		>
			<Card.Body className="d-flex flex-column h-100 p-3">
				<Stack gap={2} className="h-100">
					<Link href={link} passHref>
						<Button
							variant="link"
							className="text-start p-0 text-decoration-none"
						>
							<h5 className="text-primary fw-bold">{title}</h5>
						</Button>
					</Link>
					<div className="flex-grow-1" style={{ overflowY: "auto" }}>
						{content}
					</div>
				</Stack>
			</Card.Body>
		</Card>
	);
}

function PreviewList({
	items,
	type
}: {
	items: any[];
	type: "notepad" | "projects" | "chat";
}) {
	const router = useRouter();

	const handleItemClick = (itemId: string) => {
		if (type === "chat") {
			router.push(`/chat`);
		} else {
			router.push(`/${type}/${itemId}`);
		}
	};

	return (
		<Stack gap={3}>
			{items.map((item) => (
				<div
					key={item._id}
					className="d-flex justify-content-between align-items-center p-3 border rounded-4 shadow-sm"
					style={{
						cursor: "pointer",
						background: "white",
						transition: "transform 0.2s, box-shadow 0.2s"
					}}
					onClick={() => handleItemClick(item._id)}
					onMouseEnter={(e) => {
						e.currentTarget.style.transform = "translateY(-3px)";
						e.currentTarget.style.boxShadow =
							"0 6px 12px rgba(0, 0, 0, 0.15)";
					}}
					onMouseLeave={(e) => {
						e.currentTarget.style.transform = "translateY(0)";
						e.currentTarget.style.boxShadow =
							"0 4px 8px rgba(0, 0, 0, 0.1)";
					}}
				>
					<div>
						<h6 className="mb-2 fw-bold">{item.summary}</h6>
						{type === "notepad" && (
							<>
								<div className="mb-1">
									<Badge bg="info" className="me-2">
										Categorie
									</Badge>
									<span className="text-muted">
										{item.categories}
									</span>
								</div>
								<div>
									<Badge bg="secondary" className="me-2">
										Ultima modifica
									</Badge>
									<span className="text-muted">
										{formatDate(item.dtModified)}
									</span>
								</div>
							</>
						)}
						{type === "projects" && (
							<>
								<div className="mb-1">
									<Badge bg="warning" className="me-2">
										Nota
									</Badge>
									<span
										className="ms-2 p-0"
										onClick={(e) => {
											e.stopPropagation();
											router.push(
												`/notepad/${item.noteId}`
											);
										}}
										style={{ cursor: "pointer" }}
									>
										<FaStickyNote
											size={20}
											className="text-warning"
										/>
									</span>
								</div>
							</>
						)}
						{type === "chat" && (
							<>
								<div className="mb-1">
									<Badge bg="success" className="me-2">
										Ultimo messaggio
									</Badge>
									<span className="text-muted">
										{item.lastMessage}
									</span>
								</div>
								<div className="mb-1">
									<Badge bg="dark" className="me-2">
										Da
									</Badge>
									<span className="text-muted">
										{item.lastMessageOwner}
									</span>
								</div>
								<div>
									<Badge bg="secondary" className="me-2">
										Inviato
									</Badge>
									<span className="text-muted">
										{formatDate(item.lastMessageAt)}
									</span>
								</div>
							</>
						)}
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
		items: (ReducedActivity | ReducedEvent | ReducedSession)[],
		badgeColor: string
	) => (
		<div className="mb-3">
			<h6 className="fw-bold">
				<Badge bg={badgeColor} className="me-2">
					{title}
				</Badge>
			</h6>
			{items.length === 0 ? (
				<p className="text-muted ms-4">Nessun {title.toLowerCase()}</p>
			) : (
				<Stack gap={2} className="ms-4">
					{items.map((item) => (
						<div
							key={item._id}
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
			{renderItems("Attività", calendar.activities, "primary")}
			{renderItems("Eventi", calendar.events, "warning")}
			{renderItems("Sessione Pomodoro", calendar.sessions, "success")}
		</div>
	);
}

// Nuovo componente per la preview del Pomodoro
function PreviewPomodoro({
	pomodoro
}: {
	pomodoro: {
		modificationDate: string;
		cycles: number;
		studyTime: number;
		breakTime: number;
	};
}) {
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
			<div className="d-flex align-items-center">
				<FaRegClock className="text-secondary me-2" size={20} />
				<div>
					<h6 className="mb-0 fw-bold">Ultima modifica</h6>
					<small className="text-muted">
						{formatDate(pomodoro.modificationDate)}
					</small>
				</div>
			</div>
		</Stack>
	);
}

export default function Home() {
	const [previews, setPreviews] = useState<PreviewsResponse | null>(null);
	const { user } = useUser();

	useEffect(() => {
		fetch("/api/preview")
			.then((res) => res.json())
			.then((data: PreviewsResponse) => setPreviews(data))
			.catch((error) =>
				console.error("Error fetching preview data:", error)
			);
	}, []);

	return (
		<main>
			<GlobalSideBar />
			<Container fluid className="mt-3 px-3 overflow-hidden">
				<Row className="gx-3">
					<Col xs={12} lg={3} className="mb-3">
						<PreviewBox
							title="Chat"
							content={
								previews && (
									<PreviewList
										items={previews.chats}
										type="chat"
									/>
								)
							}
							link="/chat"
						/>
					</Col>
					<Col xs={12} lg={9}>
						<Row className="gx-3">
							<Col xs={12} md={6} className="mb-3">
								<PreviewBox
									title="Calendario"
									content={
										previews && (
											<PreviewCalendar
												calendar={previews.calendar}
											/>
										)
									}
									link="/calendar"
								/>
							</Col>
							<Col xs={12} md={6} className="mb-3">
								<PreviewBox
									title="Progetti"
									content={
										previews && (
											<PreviewList
												items={previews.projects}
												type="projects"
											/>
										)
									}
									link="/projects"
								/>
							</Col>
							<Col xs={12} md={6} className="mb-3">
								<PreviewBox
									title="Note"
									content={
										previews && (
											<PreviewList
												items={previews.notes}
												type="notepad"
											/>
										)
									}
									link="/notepad"
								/>
							</Col>
							<Col xs={12} md={6} className="mb-3">
								<PreviewBox
									title="Pomodoro"
									content={
										user?.pomodoro ? (
											<PreviewPomodoro
												pomodoro={{
													modificationDate:
														typeof user.pomodoro
															.modificationDate ===
														"string"
															? formatDate(
																	user
																		.pomodoro
																		.modificationDate
																)
															: formatDate(
																	user.pomodoro.modificationDate.toISOString()
																),
													cycles: user.pomodoro
														.cycles,
													studyTime:
														user.pomodoro.studyTime,
													breakTime:
														user.pomodoro.breakTime
												}}
											/>
										) : (
											<p className="text-muted">
												Non sono disponibili
												informazioni sul Pomodoro.
											</p>
										)
									}
									link="/pomodoro"
								/>
							</Col>
						</Row>
					</Col>
				</Row>
			</Container>
		</main>
	);
}
