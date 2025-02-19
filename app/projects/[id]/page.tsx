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
			"onload-functions": {};
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
			import("./OnLoadFunctions");
			import("./ListBody/TimeList");
			import("./ListBody/UserList");
		}
	}, []);

	return (
		<>
			<div className="container-fluid d-flex flex-column vh-100">
				<GlobalSideBar />
				<div className="row p-3 border-bottom border-secondary">
					<div className="col d-flex align-items-center">
						<a
							className="btn text-secondary me-1 p-0"
							href="/projects"
						>
							Dashboard
						</a>
						<div>/</div>
						<div className="ms-1" id="mainTitle"></div>
					</div>
					<div className="col d-flex justify-content-end align-items-center">
						<add-form-component></add-form-component>
						<project-settings></project-settings>
					</div>
				</div>
				<view-toggler></view-toggler>
			</div>
			<activity-form />
			<phase-form />
			<onload-functions />
		</>
	);
}
