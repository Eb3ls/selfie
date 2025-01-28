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
import Image from "next/image";
import { useEffect } from "react";
import { PiBroom } from "react-icons/pi";
import * as CONST from "./constants";
import "./styles.css";

declare global {
	namespace JSX {
		interface IntrinsicElements {
			"project-phase": { data: any };
			"project-phase-row": { data: any };
			"time-line": { date: string };
			"onload-functions": {};
			"form-component": {};
		}
	}
}

const testData = {
	id: 1,
	summary: "Fase 1",
	subPhases: [
		{
			id: 2,
			summary: "Sottofase 1",
			activities: [
				{
					id: 81401873948,
					summary: "Attività 1",
					status: "WAITING",
					dtStart: "2024-03-17T00:00:00",
					dtEnd: "2024-03-19T00:00:00"
				},
				{
					id: 81401873949,
					summary: "Attività 1",
					status: "ACTIVABLE",
					dtStart: "2024-03-17T00:00:00",
					dtEnd: "2024-03-19T00:00:00"
				},
				{
					id: 81401873950,
					summary: "Attività 1",
					status: "ACTIVE",
					dtStart: "2024-03-17T00:00:00",
					dtEnd: "2024-03-19T00:00:00"
				},
				{
					id: 81401873951,
					summary: "Attività 1",
					status: "SUBMITTED",
					dtStart: "2024-03-17T00:00:00",
					dtEnd: "2024-03-19T00:00:00"
				},
				{
					id: 81401873952,
					summary: "Attività 1",
					status: "COMPLETED",
					dtStart: "2024-03-17T00:00:00",
					dtEnd: "2024-03-19T00:00:00"
				},
				{
					id: 81401873953,
					summary: "Attività 1",
					status: "REACTIVATED",
					dtStart: "2024-03-17T00:00:00",
					dtEnd: "2024-03-19T00:00:00"
				},
				{
					id: 81401873954,
					summary: "Attività 1",
					status: "OVERDUE",
					dtStart: "2024-03-17T00:00:00",
					dtEnd: "2024-03-19T00:00:00"
				},
				{
					id: 81401873955,
					summary: "Attività 1",
					status: "DROPPED",
					dtStart: "2024-03-17T00:00:00",
					dtEnd: "2024-03-19T00:00:00"
				}
			]
		},
		{
			id: 3,
			summary: "Sottofase 1",
			activities: [
				{
					id: 81401873948,
					summary: "Attività 1",
					status: "WAITING",
					dtStart: "2024-03-17T00:00:00",
					dtEnd: "2024-03-19T00:00:00"
				},
				{
					id: 81401873949,
					summary: "Attività 1",
					status: "ACTIVABLE",
					dtStart: "2024-03-17T00:00:00",
					dtEnd: "2024-03-19T00:00:00"
				},
				{
					id: 81401873950,
					summary: "Attività 1",
					status: "ACTIVE",
					dtStart: "2024-03-17T00:00:00",
					dtEnd: "2024-03-19T00:00:00"
				},
				{
					id: 81401873951,
					summary: "Attività 1",
					status: "SUBMITTED",
					dtStart: "2024-03-17T00:00:00",
					dtEnd: "2024-03-19T00:00:00"
				},
				{
					id: 81401873952,
					summary: "Attività 1",
					status: "COMPLETED",
					dtStart: "2024-03-17T00:00:00",
					dtEnd: "2024-03-19T00:00:00"
				},
				{
					id: 81401873953,
					summary: "Attività 1",
					status: "REACTIVATED",
					dtStart: "2024-03-17T00:00:00",
					dtEnd: "2024-03-19T00:00:00"
				},
				{
					id: 81401873954,
					summary: "Attività 1",
					status: "OVERDUE",
					dtStart: "2024-03-17T00:00:00",
					dtEnd: "2024-03-19T00:00:00"
				},
				{
					id: 81401873955,
					summary: "Attività 1",
					status: "DROPPED",
					dtStart: "2024-03-17T00:00:00",
					dtEnd: "2024-03-19T00:00:00"
				}
			]
		}
	]
};

export default function Projects() {
	useEffect(() => {
		if (typeof window !== "undefined") {
			import("./ProjectPhase");
			import("./ProjectPhaseRow");
			import("./TimeLine");
			import("./OnLoadFunctions");
			import("./Form");
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
						<form-component></form-component>
						<button className="btn btn-primary rounded-pill">
							<div>Settings</div>
						</button>
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
						<project-phase
							data={JSON.stringify(testData)}
						></project-phase>
					</div>
					<div
						id="ganttView"
						className="col-9 hide-scrll mh-100 overflow-auto p-0"
					>
						<time-line date={new Date().toString()}></time-line>
						<project-phase-row
							data={JSON.stringify(testData)}
						></project-phase-row>
					</div>
				</div>
			</div>
			<onload-functions></onload-functions>
		</>
	);
}
