"use client";

import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Button, Card, Col, Container, Row } from "react-bootstrap";
import { FaTrash, FaUserShield } from "react-icons/fa";
import { SearchBar } from "./SearchBar";
import { GlobalSideBar } from "../components/GlobalSideBar";

// Importa il router di Next.js

export interface Project {
	_id: string; // ID del progetto (stringa)
	summary: string; // Titolo del progetto
	ownerName: string; // Nome del proprietario
	userNameList: string[]; // Lista di nomi degli utenti
	noteId: string; // ID della nota associata (stringa)
}

// TODO: utente da cookie
// Variabile provvisoria per simulare l'utente corrente
const currentUser = "prova";

export default function ProjectPage() {
	const [projects, setProjects] = useState<Project[]>([]);
	const [oldProjects, setOldProjects] = useState<Project[]>([]);
	const router = useRouter(); // Inizializza il router

	useEffect(() => {
		async function fetchProjects() {
			try {
				const response = await fetch("/api/project/getProjects");
				if (!response.ok)
					throw new Error("Errore nella richiesta dei dati");
				const data: Project[] = await response.json();
				setProjects(data);
				setOldProjects(data);
			} catch (error) {
				console.error("Errore durante il fetch dei progetti:", error);
			}
		}
		fetchProjects();
	}, []);

	function handleSort(sortParams: {
		field: string;
		direction: "asc" | "desc";
	}) {
		const { field, direction } = sortParams;

		const sortedProjects = [...projects].sort((a, b) => {
			let valueA, valueB;

			switch (field) {
				case "summary":
					valueA = a.summary.toLowerCase();
					valueB = b.summary.toLowerCase();
					break;
				case "owner":
					valueA = a.ownerName.toLowerCase();
					valueB = b.ownerName.toLowerCase();
					break;
				default:
					return 0;
			}

			return direction === "asc"
				? valueA > valueB
					? 1
					: valueA < valueB
						? -1
						: 0
				: valueA < valueB
					? 1
					: valueA > valueB
						? -1
						: 0;
		});

		setProjects(sortedProjects);
	}

	function handleSearch(e: any) {
		const searchTerm = e.target.value;

		const filteredProjects = oldProjects.filter((project) =>
			project.summary.toLowerCase().includes(searchTerm.toLowerCase())
		);

		setProjects(searchTerm !== "" ? filteredProjects : oldProjects);
	}

	async function handleAdd(project: { summary: string }) {
		console.log(project);

		const response = await fetch("/api/project/add", {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify(project)
		});
		if (!response.ok) {
			alert("Errore durante il fetch dei progetti!");
		} else {
			const fetched_data = await response.json();
			window.location.href = "./projects/" + fetched_data._id;
		}
	}

	async function handleDelete(id: string) {
		const conf = confirm("Sicuro di voler eliminare?");
		if (!conf) return;

		try {
			const response = await fetch("/api/project/delete", {
				method: "DELETE",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({ _id: id })
			});

			if (response.ok) {
				alert("Progetto eliminato con successo!");

				// Aggiorna lo stato dei progetti rimuovendo quello eliminato
				setProjects((prevProjects) =>
					prevProjects.filter((project) => project._id !== id)
				);
			} else {
				alert("Errore durante l'eliminazione del progetto!");
			}
		} catch (error) {
			console.error("Errore durante la cancellazione:", error);
			alert("Errore durante la cancellazione!");
		}
	}

	// Controlla se l'utente è il proprietario del progetto
	function isOwner(ownerName: string) {
		return ownerName === currentUser;
	}

	function handleProjectClick(project: Project) {
		// Usa il router di Next.js per navigare alla pagina del progetto
		router.push(`/projects/${project._id}`);
	}

	function handleNoteClick(noteId: string) {
		// Usa il router di Next.js per navigare alla pagina della nota
		router.push(`/notepad/${noteId}`);
	}

	return (
		<>
			<GlobalSideBar />
			<Container fluid="sm" className="mt-5 text-center px-5">
				<h1 className="mb-5">Projects</h1>
				<SearchBar
					handleSort={handleSort}
					handleSearch={handleSearch}
					handleAdd={handleAdd}
				/>
				<Row className="mt-5 gx-5 text-center">
					{projects.length === 0 ? (
						<p>Non ci sono progetti</p>
					) : (
						projects.map((project) => (
							<Col
								key={project._id}
								className="col-12 col-md-6 col-lg-4 mb-3"
							>
								<Card>
									<Card.Body>
										<div
											onClick={() =>
												handleProjectClick(project)
											}
											style={{ cursor: "pointer" }}
										>
											<Card.Title>
												{project.summary}
											</Card.Title>
											<Card.Subtitle className="mb-2 text-muted">
												Proprietario:{" "}
												{project.ownerName}
											</Card.Subtitle>
										</div>
										<hr />
										<Card.Text>
											{/* Aggiungi l'emoji della nota con link */}
											<span
												style={{ cursor: "pointer" }}
												onClick={() =>
													handleNoteClick(
														project.noteId
													)
												}
											>
												📝
											</span>
											{currentUser ==
												project.ownerName && (
													<Button
														variant="danger"
														className="ms-2 p-0"
														onClick={() =>
															handleDelete(
																project._id
															)
														}
														style={{
															border: "none",
															backgroundColor:
																"transparent",
															color: "inherit"
														}}
													>
														<FaTrash title="Delete" />
													</Button>
												)}
										</Card.Text>
									</Card.Body>
								</Card>
							</Col>
						))
					)}
				</Row>
			</Container>
		</>
	);
}
