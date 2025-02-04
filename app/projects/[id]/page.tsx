"use client";
import { GlobalSideBar } from "@/app/components/GlobalSideBar";
import * as CONST from "./Utils";
import "./styles.css";
import { useEffect } from "react";

declare global {
	namespace JSX {
		interface IntrinsicElements {
			"side-gantt-list": {};
			"project-phase-row": {};
			"time-line": { date: Date };
			"onload-functions": {};
			"add-form-component": {};
			"project-settings": {};
			"modify-activity": {};
			"modify-phase": {};
		}
	}
}

export default function Projects() {

	// Necessario in quanto con il ssr HTMLElement non é definito => non possiamo definire i custom elements
	useEffect(() => {
		if (typeof window !== "undefined") {
			import('./Forms/AddForm');
			import('./Forms/ProjectSettings');
			import('./Forms/ModifyActivity');
			import('./Forms/ModifyPhase');
			import('./GanttBody/SideGanttList');
			import('./GanttBody/ProjectPhaseRow');
			import('./GanttBody/TimeLine');
			import('./OnLoadFunctions')
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
				<div className="row p-3 border-bottom border-secondary">
					<div className="col-3 d-flex align-items-center">
						<button className="btn me-2 p-0">Gantt</button>
						<button className="btn ms-2 p-0">List</button>
					</div>
					<div className="col-9 d-flex flex-column align-items-center">
						<div className="fs-4" id="yearDiv"></div>
						<div className="fs-5" id="monthDiv"></div>
					</div>
				</div>
				<div
					className="row border-bottom border-secondary"
					style={{ height: "500px" }}
				>
					<div
						id="listView"
						className="col-3 hide-scroll z-2 border-end border-secondary bg-white mh-100 overflow-y-auto"
						style={{
							position: "sticky",
							left: "0"
						}}
					>
						<div
							id="header"
							className="row p-3 border-bottom border-secondary sticky-top bg-white"
							style={{ minHeight: `${CONST.ROW_HEIGHT_PX}` }}
						>
							<div className="col-6">Titolo</div>
							<div className="col-6 d-flex justify-content-center">
								Range
							</div>
						</div>
						<side-gantt-list></side-gantt-list>
					</div>
					<div
						id="ganttView"
						className="col-9 hide-scrll mh-100 overflow-auto p-0"
					>
						<time-line date={new Date()}></time-line>
						<project-phase-row></project-phase-row>
					</div>
				</div>
			</div >
			<modify-activity></modify-activity>
			<modify-phase></modify-phase>
			<onload-functions></onload-functions>
		</>
	);
}
