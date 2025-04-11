"use client";

import { GlobalSideBar } from "@/app/components/GlobalSideBar";
import { useUser } from "@/app/components/UserContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import { FaBook, FaCalendarAlt, FaCoffee, FaStickyNote } from "react-icons/fa";
import { toast } from "react-toastify";
import "./home.css";
import {
	CalendarPreviews,
	ChatPreviews,
	NotePreviews,
	PomodoroPreview,
	ProjectPreviews
} from "./previews";
import { PreviewsResponse } from "./types";

function WelcomeSection({ username }: { username: string | undefined }) {
	return (
		<div className="text-center py-4 mb-4">
			<h1 className="display-4 mb-3 fw-bold text-primary">
				Benvenuto in Selfie{username ? `, ${username}` : ""}! 👋
			</h1>
			<p className="lead mb-4">
				Il tuo spazio personale per organizzare studio, progetti e molto
				altro. Inizia ad esplorare le funzionalità che abbiamo creato
				per te!
			</p>
		</div>
	);
}

function CardHeader({
	title,
	icon,
	description,
	routeLink,
	accentColor
}: {
	title: string;
	icon: React.ReactNode;
	description: string;
	routeLink: () => void;
	accentColor: string;
}) {
	return (
		<div className={"p-3"}>
			<div className="d-flex align-items-center gap-3 mb-3">
				<div className={`p-2 text-${accentColor}`}>{icon}</div>
				<div className="flex-grow-1">
					<h3 className="h4 mb-1">{title}</h3>
					<p className="text-muted mb-0 small">{description}</p>
				</div>
			</div>
			<Button
				variant={accentColor}
				size="sm"
				className="rounded-pill px-4 py-2"
				onClick={routeLink}
			>
				Apri {title}
			</Button>
		</div>
	);
}

function ModernCard({
	title,
	icon,
	description,
	content,
	routeLink,
	accentColor = "primary"
}: {
	title: string;
	icon: React.ReactNode;
	description: string;
	content: React.ReactNode;
	routeLink: () => void;
	accentColor?: string;
}) {
	return (
		<div className={"card h-100 shadow-sm rounded-4 shadow-lg border-0"}>
			<div
				className={`bg-${accentColor}`}
				style={{
					position: "absolute",
					top: 0,
					left: "50%",
					transform: "translateX(-50%)",
					height: "4px",
					width: "60%",
					borderRadius: "0 0 8px 8px"
				}}
			/>
			<div className="card-body h-100 d-flex flex-column">
				<CardHeader
					title={title}
					icon={icon}
					description={description}
					routeLink={routeLink}
					accentColor={accentColor}
				/>
				<div className="card-text mb-3 overflow-auto h-max">
					{content}
				</div>
			</div>
		</div>
	);
}

export default function Home() {
	const [previews, setPreviews] = useState<PreviewsResponse | null>(null);
	const { user } = useUser();

	const router = useRouter();

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
		<div>
			<GlobalSideBar />
			<div>
				<WelcomeSection username={user?.firstName} />
				<div className="container-fluid">
					<div className="row mx-xl-5 my-5 h-xl-reset">
						<div className="col-xl-4 mb-4 mb-xl-0 h-100">
							<ModernCard
								title="Chat"
								icon={<FaStickyNote size={24} />}
								description="Messaggia con i tuoi colleghi"
								content={
									<ChatPreviews
										chats={previews?.chats || []}
									/>
								}
								routeLink={() => router.push("/chat")}
								accentColor="success"
							/>
						</div>
						<div className="col-xl-4 mb-4 mb-xl-0 h-100">
							<ModernCard
								title="Calendario"
								icon={<FaCalendarAlt size={24} />}
								description="Organizza i tuoi impegni"
								content={
									<CalendarPreviews
										calendar={
											previews?.calendar || {
												activities: [],
												projectActivities: [],
												events: [],
												sessions: []
											}
										}
									/>
								}
								routeLink={() => router.push("/calendar")}
								accentColor="info"
							/>
						</div>
						<div
							className="col-xl-4 mb-4 mb-xl-0 d-flex flex-column h-100"
							style={{
								gap: "1.5rem",
								minHeight: 0
							}}
						>
							<div style={{ flex: "1", minHeight: 0 }}>
								<ModernCard
									title="Note"
									icon={<FaBook size={24} />}
									description="Gestisci i tuoi appunti"
									content={
										<NotePreviews
											notes={previews?.notes || []}
										/>
									}
									routeLink={() => router.push("/notepad")}
									accentColor="primary"
								/>
							</div>
							<div style={{ flex: "1", minHeight: 0 }}>
								<ModernCard
									title="Progetti"
									icon={<FaStickyNote size={24} />}
									description="Coordina le tue attività"
									content={
										<ProjectPreviews
											projects={previews?.projects || []}
										/>
									}
									routeLink={() => router.push("/projects")}
									accentColor="warning"
								/>
							</div>
							<div style={{ flex: "1", minHeight: 0 }}>
								<ModernCard
									title="Pomodoro"
									icon={<FaCoffee size={24} />}
									description="Ottimizza il tuo studio"
									content={
										<PomodoroPreview
											pomodoro={user?.pomodoro}
										/>
									}
									routeLink={() => router.push("/pomodoro")}
									accentColor="danger"
								/>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
