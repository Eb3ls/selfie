"use client";

/*
 * Bottone per scorrere avanti e indietro di 12 giorni (non il massimo, magari temporaneo)
 * Associare il toggle delle fasi al toggle visivo del gantt
 * Definire la lunghezza delle attivitá in base alle colonne che dovrebbero occupare
 * Capire come avere una griglia sotto alle colonne
 * Partire dalla data corrente (da integrare poi con la time machine)
 * Poter scorrere in verticale il gantt
 *
 * */
import { useEffect } from "react";

declare global {
	namespace JSX {
		interface IntrinsicElements {
			"project-phase": { data: any };
			"project-phase-row": { data: any };
		}
	}
}

export default function Projects() {
	useEffect(() => {
		if (typeof window !== "undefined") {
			import("./ProjectPhase");
			import("./ProjectPhaseRow");
		}
	}, []);

	const testDays = [
		{ day: "Mon", number: 17 },
		{ day: "Tue", number: 18 },
		{ day: "Wed", number: 19 },
		{ day: "Thu", number: 20 },
		{ day: "Fri", number: 21 },
		{ day: "Sat", number: 22 },
		{ day: "Sun", number: 23 },
		{ day: "Mon", number: 24 },
		{ day: "Tue", number: 25 },
		{ day: "Wed", number: 26 },
		{ day: "Thu", number: 27 },
		{ day: "Fri", number: 28 }
	];

	const testData = {
		id: 11820918,
		summary: "Fase 1",
		subPhases: [
			{
				id: 172010381,
				summary: "Sottofase 1",
				activities: [
					{
						id: 81401873948,
						summary: "Attività 1",
						status: "WAITING",
						dtStart: "2024-03-17T00:00:00", // Usa stringhe ISO
						dtEnd: "2024-03-19T00:00:00"
					},
					{
						id: 81401873949,
						summary: "Attività 1",
						status: "ACTIVABLE",
						dtStart: "2024-03-17T00:00:00", // Usa stringhe ISO
						dtEnd: "2024-03-19T00:00:00"
					},
					{
						id: 81401873950,
						summary: "Attività 1",
						status: "ACTIVE",
						dtStart: "2024-03-17T00:00:00", // Usa stringhe ISO
						dtEnd: "2024-03-19T00:00:00"
					},
					{
						id: 81401873951,
						summary: "Attività 1",
						status: "SUBMITTED",
						dtStart: "2024-03-17T00:00:00", // Usa stringhe ISO
						dtEnd: "2024-03-19T00:00:00"
					},
					{
						id: 81401873952,
						summary: "Attività 1",
						status: "COMPLETED",
						dtStart: "2024-03-17T00:00:00", // Usa stringhe ISO
						dtEnd: "2024-03-19T00:00:00"
					},
					{
						id: 81401873953,
						summary: "Attività 1",
						status: "REACTIVATED",
						dtStart: "2024-03-17T00:00:00", // Usa stringhe ISO
						dtEnd: "2024-03-19T00:00:00"
					},
					{
						id: 81401873954,
						summary: "Attività 1",
						status: "OVERDUE",
						dtStart: "2024-03-17T00:00:00", // Usa stringhe ISO
						dtEnd: "2024-03-19T00:00:00"
					},
					{
						id: 81401873955,
						summary: "Attività 1",
						status: "DROPPED",
						dtStart: "2024-03-17T00:00:00", // Usa stringhe ISO
						dtEnd: "2024-03-19T00:00:00"
					}
				]
			},
			{
				id: 172010385,
				summary: "Sottofase 2",
				activities: [
					{
						id: 81401873948,
						summary: "Attività 1",
						status: "WAITING",
						dtStart: "2024-03-17T00:00:00", // Usa stringhe ISO
						dtEnd: "2024-03-19T00:00:00"
					},
					{
						id: 81401873949,
						summary: "Attività 1",
						status: "ACTIVABLE",
						dtStart: "2024-03-17T00:00:00", // Usa stringhe ISO
						dtEnd: "2024-03-19T00:00:00"
					},
					{
						id: 81401873950,
						summary: "Attività 1",
						status: "ACTIVE",
						dtStart: "2024-03-17T00:00:00", // Usa stringhe ISO
						dtEnd: "2024-03-19T00:00:00"
					},
					{
						id: 81401873951,
						summary: "Attività 1",
						status: "SUBMITTED",
						dtStart: "2024-03-17T00:00:00", // Usa stringhe ISO
						dtEnd: "2024-03-19T00:00:00"
					},
					{
						id: 81401873952,
						summary: "Attività 1",
						status: "COMPLETED",
						dtStart: "2024-03-17T00:00:00", // Usa stringhe ISO
						dtEnd: "2024-03-19T00:00:00"
					},
					{
						id: 81401873953,
						summary: "Attività 1",
						status: "REACTIVATED",
						dtStart: "2024-03-17T00:00:00", // Usa stringhe ISO
						dtEnd: "2024-03-19T00:00:00"
					},
					{
						id: 81401873954,
						summary: "Attività 1",
						status: "OVERDUE",
						dtStart: "2024-03-17T00:00:00", // Usa stringhe ISO
						dtEnd: "2024-03-19T00:00:00"
					},
					{
						id: 81401873955,
						summary: "Attività 1",
						status: "DROPPED",
						dtStart: "2024-03-17T00:00:00", // Usa stringhe ISO
						dtEnd: "2024-03-19T00:00:00"
					}
				]
			}
		]
	};

	return (
		<div className="container-fluid d-flex flex-column vh-100">
			<nav className="navbar navbar-expand-lg navbar-light bg-light p-0">
				<div className="container-fluid">
					<a className="navbar-brand" href="./home">
						<img
							src="./Sloth.png"
							alt="Logo"
							height="50"
							aspect-ratio="2.2/1"
							className="d-inline-block align-text-top"
						/>
					</a>
					<button
						className="navbar-toggler"
						type="button"
						data-bs-toggle="collapse"
						data-bs-target="#navbarNav"
						aria-controls="navbarNav"
						aria-expanded="false"
						aria-label="Toggle navigation"
					>
						<span className="navbar-toggler-icon"></span>
					</button>
					<div className="collapse navbar-collapse" id="navbarNav">
						<div className="navbar-nav nav-underline mx-auto">
							<a className="nav-link" href="./calendar">
								Calendario
							</a>
							<a
								className="nav-link active"
								aria-current="page"
								href="./projects"
							>
								Progetti
							</a>
							<a className="nav-link" href="./notepad">
								Note
							</a>
							<a className="nav-link" href="./chat">
								Chat
							</a>
							<a className="nav-link" href="./pomodoro">
								Pomodoro
							</a>
						</div>
					</div>
				</div>
			</nav>
			<div className="row p-3 border-bottom border-secondary">
				<div className="col d-flex align-items-center">
					<a className="btn text-secondary me-1 p-0" href="./error">
						Dashboard
					</a>
					<div>/</div>
					<div className="ms-1">Progetto di prova</div>
				</div>
				<div className="col d-flex justify-content-end align-items-center">
					<button className="btn btn-primary me-2 rounded-pill">
						<div>+ New</div>
					</button>
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
					<div className="fs-4">2024</div>
					<div className="fs-5">Marzo</div>
				</div>
			</div>
			<div className="row flex-grow-1 overflow-y-auto">
				<div className="col-3 border-end border-secondary">
					<div className="row p-3 border-bottom border-secondary sticky-top bg-white">
						<div className="col-6">Titolo</div>
						<div className="col-6 d-flex justify-content-center">
							Range
						</div>
					</div>
					<project-phase
						data={JSON.stringify(testData)}
					></project-phase>
				</div>
				<div className="col-9 border-end border-secondary">
					<div className="row p-1 border-bottom border-secondary sticky-top bg-white">
						{testDays.map((item, index) => (
							<div
								className="col d-flex flex-column align-items-center justify-content-between border-end border-secondary"
								key={index}
							>
								<div>{item.day}</div>
								<div>{item.number}</div>
							</div>
						))}
					</div>
					<project-phase-row
						data={JSON.stringify(testData)}
					></project-phase-row>
				</div>
			</div>
		</div>
	);
}
