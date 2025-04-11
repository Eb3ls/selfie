"use client";

import { GlobalSideBar } from "@/app/components/GlobalSideBar";
import { useUser } from "@/app/components/UserContext";
import { useEffect, useState } from "react";
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
	return (
		<div className={`card h-100 shadow-sm border-${accentColor}`}>
			<div className="card-body h-100 d-flex flex-column">
				<div className="d-flex align-items-center mb-3">
					<span className={`text-${accentColor} me-2 fs-4`}>
						{icon}
					</span>
					<h5 className="card-title mb-0">{title}</h5>
				</div>
				<p className="card-text text-muted small">{description}</p>
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
								link="/chat"
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
								link="/calendar"
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
									link="/notepad"
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
									link="/projects"
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
									link="/pomodoro"
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
