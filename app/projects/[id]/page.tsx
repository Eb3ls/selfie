"use client";

import { GlobalSideBar } from "@/app/components/GlobalSideBar";
import { useTime } from "@/app/components/TimeContext";
import { useUser } from "@/app/components/UserContext";
import { useEffect, useRef, useState } from "react";
import ViewToggler from "./ViewToggler";
import "./styles.css";

declare global {
	namespace JSX {
		interface IntrinsicElements {
			"view-toggler": {};
			"activity-form": {};
			"phase-form": {};
		}
	}
}

export default function Projects() {
	const { dateTime } = useTime();
	const [showContent, setShowContent] = useState(false);
	const { user } = useUser();

	// Necessario in quanto con il ssr HTMLElement non é definito => non possiamo definire i custom elements
	// Importiamo solo dopo che user é definito per evitare di renderizzare il contenuto prima di avere tutti i dati
	useEffect(() => {
		if (typeof window !== "undefined" && user) {
			Promise.all([
				import("./Forms/AddForm"),
				import("./Forms/ProjectSettings"),
				import("./Forms/ActivityForm"),
				import("./Forms/PhaseForm"),
				import("./GanttBody/SideGanttList"),
				import("./GanttBody/ProjectPhaseRow"),
				import("./GanttBody/TimeLine"),
				import("./ListBody/TimeList"),
				import("./ListBody/UserList"),
				import("./ViewToggler")
			]).then(() => {
				setShowContent(true);
			});
		}
	}, [user]);

	const prevDayRef = useRef<number | null>(null);

	useEffect(() => {
		if (!showContent || !dateTime || !user) return;
		const viewToggler = document.querySelector(
			"view-toggler"
		) as ViewToggler;

		if (!viewToggler) {
			return;
		}
		const currentDate = new Date(dateTime);
		const currentDay = currentDate.getDate();

		// Se la data non é ancora stata impostata o il giorno é lo stesso non facciamo nulla
		if (prevDayRef.current !== null && prevDayRef.current === currentDay) {
			return;
		}

		viewToggler.currentDate = currentDate;

		// Se abbiamo giá impostato la data e il giorno é diverso, aggiorniamo la pagina
		if (prevDayRef.current !== null) {
			viewToggler.updatePage();
		} else {
			viewToggler.currentUser = {
				id: user._id,
				name: user.username
			};
		}

		prevDayRef.current = currentDay;
	}, [showContent, user, dateTime]);

	return (
		<>
			{!showContent ? (
				<div className="d-flex justify-content-center align-items-center dvh-100 overflow-auto">
					<div className="spinner-border text-primary" role="status">
						<span className="visually-hidden">Caricamento...</span>
					</div>
				</div>
			) : (
				<div className="d-flex flex-column dvh-100 vw-100">
					<GlobalSideBar />
					<view-toggler />
					<activity-form />
					<phase-form />
				</div>
			)}
		</>
	);
}
