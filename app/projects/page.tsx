"use client";

import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Card, Container } from "react-bootstrap";
import { FaUserShield } from "react-icons/fa";
import { toast } from "react-toastify";
import { GlobalSideBar } from "../components/GlobalSideBar";
import { useUser } from "../components/UserContext";
import { SearchBar } from "./SearchBar";
import "./style.css";

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

				if (!response.ok) {
					throw new Error();
				}

				const data: Project[] = await response.json();
				setProjects(data);
				setOldProjects(data);
			} catch (error) {
				toast.error("Errore durante il caricamento dei dati");
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
		try {
			const response = await fetch("/api/project/add", {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify(project)
			});

			if (!response.ok) {
				throw new Error();
			}

			const fetched_data = await response.json();

			toast.success("Progetto creato con successo");
			router.push("/projects/" + fetched_data._id);
		} catch (error) {
			toast.error("Errore durante la creazione del progetto");
		}
	}

	// Controlla se l'utente è il proprietario del progetto
	function isOwner(ownerName: string) {
		return ownerName === user?.username;
	}

	function handleProjectClick(project: Project) {
		// Usa il router di Next.js per navigare alla pagina del progetto
		router.push(`/projects/${project._id}`);
	}

	function handleNoteClick(noteId: string) {
		// Usa il router di Next.js per navigare alla pagina della nota
		router.push(`/notepad/${noteId}`);
	}

	function createProjectEntry(project: Project, isOwner: boolean) {
		return (
			<div
				className="project-card bg-white rounded-4 h-100 hover-lift-2"
				key={project._id}
				onClick={() => handleProjectClick(project)}
			>
				<div className="p-4">
					<div className="d-flex align-items-center gap-2 mb-3">
						{isOwner && (
							<FaUserShield
								title="Proprietario"
								className="text-warning flex-shrink-0"
								size={20}
							/>
						)}
						<h3 className="h5 fw-bold m-0 text-truncate">
							{project.summary}
						</h3>
					</div>

					<div className="d-flex flex-column gap-3">
						<div>
							<span className="label d-block mb-1">
								Proprietario
							</span>
							<span className="fw-medium">
								{project.ownerName}
							</span>
						</div>

						{project.userNameList.length > 0 && (
							<div>
								<span className="label d-block mb-1">
									Collaboratori
								</span>
								<span className="text-truncate">
									{project.userNameList.join(", ")}
								</span>
							</div>
						)}
					</div>

					<button
						className="btn w-100 mt-4 btn-primary text-white"
						onClick={(e) => {
							e.stopPropagation();
							handleNoteClick(project.noteId);
						}}
					>
						Apri nota 📝
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="dvh-100 bg-light overflow-auto">
			<GlobalSideBar />
			<main className="container py-5">
				<div className="bg-white rounded-4 shadow-sm p-4 mb-5">
					<SearchBar
						handleSort={handleSort}
						handleSearch={handleSearch}
						handleAdd={handleAdd}
					/>
				</div>

				<div className="projects-grid gap-3">
					{projects.length === 0 ? (
						<div className="text-center text-muted py-5">
							<p className="mb-0">Nessun progetto trovato</p>
						</div>
					) : (
						projects.map((project) =>
							createProjectEntry(
								project,
								isOwner(project.ownerName)
							)
						)
					)}
				</div>
			</main>
		</div>
	);
}
