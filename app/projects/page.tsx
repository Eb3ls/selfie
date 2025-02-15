"use client";

import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Button, Card, Col, Container, Row } from "react-bootstrap";
import { FaTrash, FaUserShield } from "react-icons/fa";
import { GlobalSideBar } from "../components/GlobalSideBar";
import { useUser } from "../components/UserContext";
import styles from "./Projects.module.css";
import { SearchBar } from "./SearchBar";

// Importa il router di Next.js

export interface Project {
	_id: string; // ID del progetto (stringa)
	summary: string; // Titolo del progetto
	ownerName: string; // Nome del proprietario
	userNameList: string[]; // Lista di nomi degli utenti
	noteId: string; // ID della nota associata (stringa)
}

export default function ProjectPage() {
	const { user } = useUser();

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
		return ownerName === user?._id;
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
			<Container className={styles.container}>
				<div className={styles.header}>
					<h1 className={styles.title}>Projects</h1>
					<SearchBar
						handleSort={handleSort}
						handleSearch={handleSearch}
						handleAdd={handleAdd}
					/>
				</div>

				<div className={styles.projectsGrid}>
					{projects.length === 0 ? (
						<div className={styles.emptyState}>
							<p>
								No projects found. Start by creating a new one!
							</p>
						</div>
					) : (
						projects.map((project) => (
							<Card
								key={project._id}
								className={styles.projectCard}
							>
								<div className={styles.cardHeader}>
									<div className={styles.iconsContainer}>
										{isOwner(project.ownerName) && (
											<FaUserShield
												className={`${styles.icon} ${styles.ownerIcon}`}
												title="Owner"
											/>
										)}
									</div>
									{isOwner(project.ownerName) && (
										<Button
											variant="link"
											className={styles.deleteBtn}
											onClick={() =>
												handleDelete(project._id)
											}
										>
											<FaTrash />
										</Button>
									)}
								</div>

								<Card.Body
									className={styles.cardBody}
									onClick={() => handleProjectClick(project)}
								>
									<Card.Title className={styles.cardTitle}>
										{project.summary}
									</Card.Title>
									<Card.Subtitle
										className={styles.cardSubtitle}
									>
										Owner: {project.ownerName}
									</Card.Subtitle>

									{project.userNameList.length > 0 && (
										<div className={styles.projectUsers}>
											<span>Collaboratori: </span>
											{project.userNameList.join(", ")}
										</div>
									)}

									<div className={styles.actionBar}>
										<span
											className={styles.noteLink}
											onClick={(e) => {
												e.stopPropagation();
												handleNoteClick(project.noteId);
											}}
										>
											Open Note 📝
										</span>
									</div>
								</Card.Body>
							</Card>
						))
					)}
				</div>
			</Container>
		</>
	);
}
