"use client";
import { GlobalSideBar } from "@/app/components/GlobalSideBar";

/*
 * Bottone per scorrere avanti e indietro di 12 giorni (non il massimo, magari temporaneo)
 * Associare il toggle delle fasi al toggle visivo del gantt
 * Definire la lunghezza delle attivitá in base alle colonne che dovrebbero occupare
 * Capire come avere una griglia sotto alle colonne
 * Partire dalla data corrente (da integrare poi con la time machine)
 * Poter scorrere in verticale il gantt
 *
 * */
import { useEffect, useState } from "react";
import * as CONST from "./Utils";
import "./styles.css";
import { title } from "process";

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

	async function getData() {
		try {
			const projectID = window.location.pathname.split("/")[2];
			const res = await fetch(`/api/project/${projectID}`);
			const data = await res.json();

			if (!res.ok) {
				throw new Error("Failed to get data");
			}

			return data
		}
		catch (error) {
			console.error(error);
			alert("Failed to get data, please try again");
			return null;
		}
	}

	useEffect(() => {
		if (typeof window !== "undefined") {
			import("./GanttBody/SideGanttList");
			import("./GanttBody/ProjectPhaseRow");
			import("./GanttBody/TimeLine");
			import("./OnLoadFunctions");
			import("./Forms/ProjectSettings");
			import("./Forms/AddForm");
			import("./Forms/ModifyActivity")
			import("./Forms/ModifyPhase")
			const fetchData = async () => {
				const data = await getData();
				const ProjectSettings = document.querySelector("project-settings") as any;
				ProjectSettings?.loadProjectData(data.summary, data.users);
				const AddFormComponent = document.querySelector("add-form-component") as any;
				AddFormComponent?.loadProjectData(data._id, data.phases);
				const SideGanttList = document.querySelector("side-gantt-list") as any;
				SideGanttList?.loadProjectData(data.phases);
				const ProjectPhaseRow = document.querySelector("project-phase-row") as any;
				ProjectPhaseRow?.loadProjectData(data.phases);
			};
			fetchData();
			// TODO - Sorting per data
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
						<div className="ms-1">Progetto di prova</div>
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
