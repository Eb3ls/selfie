"use client";

import { GlobalSideBar } from "@/app/components/GlobalSideBar";
import { useTime } from "@/app/components/TimeContext";
import { useEffect, useState } from "react";
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

	const [componentsLoaded, setComponentsLoaded] = useState(false);

	// Necessario in quanto con il ssr HTMLElement non é definito => non possiamo definire i custom elements
	useEffect(() => {
		if (typeof window !== "undefined") {
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
			]).then(() => setComponentsLoaded(true));
		}
	}, []);

	useEffect(() => {
		// Assegna il valore di dateTime al custom element view-toggler
		const viewToggler = document.querySelector("view-toggler") as any;
		if (viewToggler) {
			viewToggler.dateTime = dateTime;
		}
	}, [dateTime]);

	if (!componentsLoaded) {
		return (
			<div className="d-flex justify-content-center align-items-center vh-100">
				<div className="spinner-border text-primary" role="status">
					<span className="visually-hidden">Caricamento...</span>
				</div>
			</div>
		);
	}

	return (
		<div className="d-flex flex-column vh-100 vw-100">
			<GlobalSideBar />
			<view-toggler />
			<activity-form />
			<phase-form />
		</div>
	);
}
