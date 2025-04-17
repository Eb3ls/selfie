"use client";

import { GlobalSideBar } from "@/app/components/GlobalSideBar";
import { useUser } from "@/app/components/UserContext";
import { StringNote } from "@/utils/db/db";
import { generalFetcher, safeFetch } from "@/utils/fetch/fetch";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import { FaLock, FaTrash, FaUser, FaUserShield } from "react-icons/fa";
import { FaChartGantt, FaTimeline } from "react-icons/fa6";
import { MdPublic } from "react-icons/md";
import { toast } from "react-toastify";
import useSWR from "swr";
import { DeleteNoteModal } from "./DeleteNoteModal";
import { SearchBar } from "./SearchBar";
import "./style.css";

// Tipo che estende StringNote per includere il campo type

interface ExtendedStringNote extends StringNote {
	type: string;
	ownerName: string;
}

export default function Notepad() {
	const { user } = useUser();
	const router = useRouter();

	const [notes, setNotes] = useState<ExtendedStringNote[]>([]);
	const [oldNotes, setOldNotes] = useState<ExtendedStringNote[]>([]);

	const { data, error, mutate } = useSWR<ExtendedStringNote[]>(
		"/api/notepad/getNotes",
		generalFetcher
	);

	// Aggiorna notes quando i dati vengono recuperati
	useEffect(() => {
		if (data) {
			const orderedData = data.sort((a, b) => {
				const dateA = new Date(a.dtModified).getTime();
				const dateB = new Date(b.dtModified).getTime();
				return dateB - dateA;
			});

			console.log(orderedData);

			setOldNotes(orderedData);
			setNotes(orderedData);
		}
	}, [data]);

	function handleFilters(filters: any) {
		setOldNotes(notes);

		const {
			creationDateMin,
			creationDateMax,
			lengthMin,
			lengthMax,
			categories
		} = filters;

		if (!data) {
			return;
		}

		const filteredNotes = data.filter((note: any) => {
			// Controllo delle date
			const noteDate = new Date(note.dtStamp);
			const isDateValid =
				(!creationDateMin || noteDate >= new Date(creationDateMin)) &&
				(!creationDateMax || noteDate <= new Date(creationDateMax));

			// Controllo della lunghezza
			const noteLength = note.length; // Assicurati che questo campo esista nelle tue note
			const isLengthValid =
				(lengthMin === undefined || noteLength >= lengthMin) &&
				(lengthMax === undefined || noteLength <= lengthMax);

			// Controllo delle categorie
			const categoriesArray = note.categories
				.split(",")
				.map((cat: any) => cat.trim()); // Assicurati che le categorie siano separate da virgole
			const isCategoryValid =
				!categories ||
				categoriesArray.some((cat: any) => cat.includes(categories));

			// Restituisce true solo se tutti i filtri sono validi
			return isDateValid && isLengthValid && isCategoryValid;
		});

		// Imposta le note filtrate nello stato
		setNotes(filteredNotes);
		setOldNotes(filteredNotes);
	}

	function handleSort(sortParams: {
		field: string;
		direction: "asc" | "desc";
	}) {
		const { field, direction } = sortParams;

		// Funzione di ordinamento basata sul campo e direzione
		const sortedNotes = [...notes].sort((a: any, b: any) => {
			let valueA, valueB;

			// Determina i valori per il confronto basati sul campo
			switch (field) {
				case "alphabetical":
					valueA = a.summary.toLowerCase(); // Assumendo che il titolo delle note sia "title"
					valueB = b.summary.toLowerCase();
					break;
				case "date":
					valueA = new Date(a.dtStamp).getTime(); // Data in formato timestamp
					valueB = new Date(b.dtStamp).getTime();
					break;
				case "length":
					valueA = a.length; // Assumendo che ci sia una proprietà "length" nelle note
					valueB = b.length;
					break;
				default:
					return 0;
			}

			// Esegui l'ordinamento
			if (direction === "asc") {
				return valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
			} else {
				return valueA < valueB ? 1 : valueA > valueB ? -1 : 0;
			}
		});

		// Aggiorna lo stato delle note ordinate
		setNotes(sortedNotes);
		setOldNotes(sortedNotes);
	}

	function handleSearch(e: any) {
		const searchTerm = e.target.value;

		const filteredNotes = oldNotes.filter((note: any) => {
			return note.summary
				.toLowerCase()
				.includes(searchTerm.toLowerCase());
		});

		searchTerm !== "" ? setNotes(filteredNotes) : setNotes(oldNotes);
	}

	async function handleAdd(note: { summary: string; categories: string }) {
		const response = await safeFetch(
			fetch("/api/notepad/add", {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify(note)
			})
		);
		if (!response.ok) {
			toast.error("Errore durante la creazione della nota!");
		} else {
			const fetched_data = response.body;
			toast.success("Nota creata con successo!");
			router.push("/notepad/" + fetched_data._id);
		}
	}

	async function handleDelete(id: string) {
		const response = await safeFetch(
			fetch("/api/notepad/delete", {
				method: "DELETE",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({ _id: id })
			})
		);

		if (!response.ok) {
			if (response.status == 401) {
				toast.error(
					"La nota appartiene a un progetto o a una attività di progetto!"
				);
			} else {
				toast.error("Errore durante l'eliminazione della nota!");
			}
		} else {
			toast.success("Nota eliminata con successo!");
			mutate();
		}
	}

	// Funzione per restituire l'icona corretta per il campo access
	function getAccessIcon(access: string) {
		switch (access) {
			case "PRIVATE":
				return (
					<FaLock
						title="Privata"
						size={20}
						className="flex-shrink-0 green-icon"
					/>
				);
			case "INVITED":
				return (
					<FaUser
						title="A invito"
						size={20}
						className="flex-shrink-0 green-icon"
					/>
				);
			case "PUBLIC":
				return (
					<MdPublic
						title="Pubblica"
						size={20}
						className="flex-shrink-0 green-icon"
					/>
				);
			default:
				return null;
		}
	}

	// Funzione per restituire l'icona corretta per il campo type
	function getTypeIcon(type: string) {
		switch (type) {
			case "project":
				return (
					<div className="text-warning">
						<FaChartGantt
							title="Progetto"
							className="flex-shrink-0"
							size={20}
						/>
					</div>
				);
			case "activity":
				return (
					<div className="text-calendar-projectActivity">
						<FaTimeline
							title="Attività di Progetto"
							className="flex-shrink-0"
							size={20}
						/>
					</div>
				);
			default:
				return null;
		}
	}

	// Funzione per verificare se l'utente è il proprietario della nota
	function isOwner(ownerId: string) {
		return ownerId === user?._id;
	}

	function handleNoteClick(note: any) {
		router.push("/notepad/" + note._id);
	}

	function categoriesBlock(categories: string) {
		if (!categories) {
			return <div style={{ minHeight: "44px" }}></div>;
		}

		const categoriesArray = categories.split(",").map((cat) => cat.trim());

		const block = categoriesArray.map((cat, index) => (
			<span className="category-badge rounded-pill px-2 py-1" key={index}>
				{cat}
			</span>
		));

		return (
			<div className="rounded-3 p-2 d-flex gap-2 flex-nowrap overflow-auto hide-scrollbar">
				{block}
			</div>
		);
	}

	function createNoteEntry(note: ExtendedStringNote) {
		const noteEntry = (
			<div
				className="note-card bg-white rounded-4 h-100 hover-lift-2"
				key={note._id}
				onClick={() => handleNoteClick(note)}
			>
				<div className="p-4 h-100 d-flex flex-column">
					<div
						className="d-flex align-items-center gap-2 mb-3"
						style={{ minHeight: "38px" }}
					>
						{getAccessIcon(note.access)}
						{note.type !== "note" && getTypeIcon(note.type)}
						{isOwner(note.ownerId) && (
							<FaUserShield
								title="Sei il proprietario"
								className="text-primary flex-shrink-0"
								size={20}
							/>
						)}
						<h3 className="h5 fw-bold m-0 text-truncate">
							{note.summary}
						</h3>
						<div className="ms-auto d-flex gap-2">
							{note.ownerId === user?._id &&
								note.type === "note" && (
									<DeleteNoteModal
										handleDelete={(e: any) => {
											e.preventDefault();
											handleDelete(note._id!);
										}}
									>
										<Button
											variant="link"
											className="text-danger"
										>
											<FaTrash className="hover-lift hover-grow" />
										</Button>
									</DeleteNoteModal>
								)}
						</div>
					</div>
					<div className="d-flex flex-column gap-2 flex-grow-1">
						<div>
							<span className="label d-block mb-1">
								Proprietario
							</span>
							<span className="fw-medium">{note.ownerName}</span>
						</div>

						{categoriesBlock(note.categories)}

						{note.text ? (
							<div className="multiline-truncate">
								{note.text}
							</div>
						) : (
							<div className="text-center text-muted py-3 flex-grow-1 d-flex flex-column justify-content-end">
								<span className="fs-3 p-2">✏️</span>
								<p>
									Questa nota è vuota. Clicca per modificarla.
								</p>
							</div>
						)}
					</div>
				</div>
			</div>
		);

		// Calcola l'altezza massima del contenuto

		return noteEntry;
	}

	return (
		<div className="dvh-100 overflow-auto bg-light">
			<GlobalSideBar />
			<div className="container py-5">
				<div className="bg-white rounded-4 shadow-sm p-4 mb-4 mb-lg-5">
					<SearchBar
						handleFilters={handleFilters}
						handleSort={handleSort}
						handleSearch={handleSearch}
						handleAdd={handleAdd}
					/>
				</div>

				{error ? (
					<div className="text-center text-danger py-5 bg-white rounded-4 shadow-sm">
						<i className="bi bi-exclamation-triangle-fill fs-1 mb-3 d-block"></i>
						<p className="mb-0 fw-medium">
							Si è verificato un errore durante il caricamento
							delle note
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
							Caricamento note in corso...
						</p>
					</div>
				) : (
					<div className="note-grid gap-3">
						{notes.length === 0 ? (
							<div className="text-center text-muted py-5">
								<p className="mb-0">Nessuna nota trovata</p>
							</div>
						) : (
							notes.map((note: ExtendedStringNote) =>
								createNoteEntry(note)
							)
						)}
					</div>
				)}
			</div>
		</div>
	);
}
