"use client";

import { useEffect } from "react";

declare global {
	namespace JSX {
		interface IntrinsicElements {
			"project-phase": { data: string };
		}
	}
}

export default function Projects() {
	useEffect(() => {
		if (typeof window !== "undefined") {
			import("./ProjectPhase");
		}
	}, []);

	return (
		<div>
			<div className="container-fluid">
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
						<div
							className="collapse navbar-collapse"
							id="navbarNav"
						>
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
						<a
							className="btn text-secondary me-1 p-0"
							href="./error"
						>
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
				<div className="row">
					<div className="col-3 border-end border-secondary">
						<div className="row p-3 border-bottom border-secondary">
							<div className="col-6">Titolo</div>
							<div className="col-6 d-flex justify-content-center">
								Range
							</div>
						</div>
						<div className="row p-3">
							<project-phase data="Fase 1"></project-phase>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
