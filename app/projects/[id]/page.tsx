"use client";

import { GlobalSideBar } from "@/app/components/GlobalSideBar";
import { useEffect } from "react";
import "./styles.css";

declare global {
	namespace JSX {
		interface IntrinsicElements {
			"add-form-component": {};
			"project-settings": {};
			"view-toggler": {};
			"activity-form": {};
			"phase-form": {};
		}
	}
}

export default function Projects() {
	// Necessario in quanto con il ssr HTMLElement non é definito => non possiamo definire i custom elements
	useEffect(() => {
		if (typeof window !== "undefined") {
			import("./ViewToggler");
			import("./Forms/AddForm");
			import("./Forms/ProjectSettings");
			import("./Forms/ActivityForm");
			import("./Forms/PhaseForm");
			import("./GanttBody/SideGanttList");
			import("./GanttBody/ProjectPhaseRow");
			import("./GanttBody/TimeLine");
			import("./ListBody/TimeList");
			import("./ListBody/UserList");
		}
	}, []);

	return (
		<div className="d-flex flex-column vh-100 vw-100">
			<GlobalSideBar />
			<view-toggler />
			<activity-form />
			<phase-form />
		</div>
	);
}
