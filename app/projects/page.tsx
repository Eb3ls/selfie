"use client";

import { generalFetcher, safeFetch } from "@/utils/fetch/fetch";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { FaUserShield } from "react-icons/fa";
import { toast } from "react-toastify";
import useSWR from "swr";
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

	const [projectList, setProjectList] = useState<Project[]>([]);
	const router = useRouter(); // Inizializza il router

	const { data, error } = useSWR<Project[]>(
		"/api/project/getProjects",
		generalFetcher
	);

	const [sortParams, setSortParams] = useState<{
		field: string;
		direction: "asc" | "desc";
	} | null>(null);

	const [searchTerm, setSearchTerm] = useState<string>("");

	// Aggiorna projects quando i dati vengono recuperati
	useEffect(() => {
		if (data) {
			setProjectList(data);
		}
	}, [data]);

	function handleSort(projects: Project[]): Project[] {
		if (!sortParams) {
			return projects;
		}

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

		return sortedProjects;
	}

	function handleSearch(projects: Project[]): Project[] {
		if (searchTerm === "") {
			return projects;
		}

		const filteredProjects = projects.filter((project) =>
			project.summary.toLowerCase().includes(searchTerm.toLowerCase())
		);

		return filteredProjects;
	}

	async function handleAdd(project: { summary: string }) {
		const response = await safeFetch(
			fetch("/api/project/add", {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify(project)
			})
		);

		if (!response.ok) {
			toast.error("Errore durante la creazione del progetto");
			return;
		}

		const fetched_data = response.body;

		toast.success("Progetto creato con successo");
		router.push("/projects/" + fetched_data._id);
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

	function getSortInfo() {
		if (!sortParams) {
			return null;
		}

		const { field, direction } = sortParams;

		let icon = direction === "asc" ? "↑" : "↓";

		let fieldText = "";
		if (field === "owner") {
			fieldText = "proprietario";
		} else if (field === "summary") {
			fieldText = "titolo";
		}

		return (
			<span className="text-muted small d-flex align-items-center justify-content-center mt-3 p-3">
				Ordinato per {fieldText} {icon}
			</span>
		);
	}

	const finalProjects = handleSort(handleSearch(projectList));

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
								<p className="text-truncate m-0 p-0">
									{project.userNameList.join(", ")}
								</p>
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
			<div className="container py-5">
				<div className="bg-white rounded-4 shadow-sm p-4 mb-4 mb-lg-5">
					<SearchBar
						handleAdd={handleAdd}
						setSortParams={setSortParams}
						setSearchTerm={setSearchTerm}
					/>

					{getSortInfo()}
				</div>

				{error ? (
					<div className="text-center text-danger py-5 bg-white rounded-4 shadow-sm">
						<i className="bi bi-exclamation-triangle-fill fs-1 mb-3 d-block"></i>
						<p className="mb-0 fw-medium">
							Si è verificato un errore durante il caricamento dei
							progetti
						</p>
						<p className="text-muted small mb-0">
							Riprova più tardi
						</p>
					</div>
				) : !data ? (
					<div className="text-center py-5 bg-white rounded-4 shadow-sm">
						<div
							className="spinner-border text-primary mb-3"
							role="status"
						>
							<span className="visually-hidden">
								Caricamento...
							</span>
						</div>
						<p className="mb-0 text-muted">
							Caricamento progetti in corso...
						</p>
					</div>
				) : (
					<div className="projects-grid gap-3">
						{finalProjects.length === 0 ? (
							<div className="text-center text-muted py-5">
								<p className="mb-0">Nessun progetto trovato</p>
							</div>
						) : (
							finalProjects.map((project) =>
								createProjectEntry(
									project,
									isOwner(project.ownerName)
								)
							)
						)}
					</div>
				)}
			</div>
		</div>
	);
}
