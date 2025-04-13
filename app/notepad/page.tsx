"use client";

import { GlobalSideBar } from "@/app/components/GlobalSideBar";
import { useUser } from "@/app/components/UserContext";
import { StringNote } from "@/utils/db/db";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Button, Card, Container } from "react-bootstrap";
import { FaLock, FaTrash, FaUser, FaUserShield } from "react-icons/fa";
import { FaChartGantt, FaTimeline } from "react-icons/fa6";
import { MdPublic } from "react-icons/md";
import { toast } from "react-toastify";
import useSWR from "swr";
import { showConfirmToast } from "./ConfirmToast";
import styles from "./Notepad.module.css";
import { SearchBar } from "./SearchBar";

async function fetcher(url: string) {
	const response = await fetch(url);
	if (!response.ok) {
		toast.error("Errore durante il recupero delle note!");
	}
	return response.json();
}

// Tipo che estende StringNote per includere il campo type

interface ExtendedStringNote extends StringNote {
	type: string;
}

export default function Notepad() {
	const { user } = useUser();
	const router = useRouter();

	const [notes, setNotes] = useState<ExtendedStringNote[]>([]);
	const [oldNotes, setOldNotes] = useState<ExtendedStringNote[]>([]);

	const { data, error, mutate } = useSWR("/api/notepad/getNotes", fetcher);

	// Aggiorna notes quando i dati vengono recuperati
	useEffect(() => {
		if (data) {
			setOldNotes(data);
			setNotes(data);
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
		const response = await fetch("/api/notepad/add", {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify(note)
		});
		if (!response.ok) {
			toast.error("Errore durante la creazione della nota!");
		} else {
			const fetched_data = await response.json();
			toast.success("Nota creata con successo!");
			router.push("/notepad/" + fetched_data._id);
		}
	}

	async function handleDelete(id: string) {
		const response = await fetch("/api/notepad/delete", {
			method: "DELETE",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({ _id: id })
		});

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
				return <FaLock title="Privata" />;
			case "INVITED":
				return <FaUser title="A invito" />;
			case "PUBLIC":
				return <MdPublic title="Pubblica" />;
			default:
				return null;
		}
	}

	// Funzione per restituire l'icona corretta per il campo type
	function getTypeIcon(type: string) {
		switch (type) {
			case "project":
				return <FaChartGantt title="Progetto" />;
			case "activity":
				return <FaTimeline title="Attività di Progetto" />;
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

	return (
		<div>
			<GlobalSideBar />
			<Container className={styles.container}>
				<div className={styles.header}>
					<SearchBar
						handleFilters={handleFilters}
						handleSort={handleSort}
						handleSearch={handleSearch}
						handleAdd={handleAdd}
					/>
				</div>

				{error && <div>Caricamento fallito</div>}
				{!data ? (
					<div className={styles.loadingState}>Caricamento...</div>
				) : (
					<div className={styles.notesGrid}>
						{notes.length === 0 ? (
							<div className={styles.emptyState}>
								<p>
									Nessuna nota trovata. Creane una nuova per
									cominciare!
								</p>
							</div>
						) : (
							notes.map((note: ExtendedStringNote) => (
								<Card
									key={note._id}
									className={styles.noteCard}
								>
									<div className={styles.cardHeader}>
										<div className={styles.iconsContainer}>
											<span
												className={`${styles.icon} ${
													note.access === "PRIVATE"
														? styles.privateIcon
														: note.access ===
															  "PUBLIC"
															? styles.publicIcon
															: styles.invitedIcon
												}`}
											>
												{getAccessIcon(note.access)}
											</span>
											{note.type !== "note" && (
												<span
													className={`${styles.icon} ${styles.projectIcon}`}
												>
													{getTypeIcon(note.type)}
												</span>
											)}
											{isOwner(note.ownerId) && (
												<FaUserShield
													className={`${styles.icon} ${styles.ownerIcon}`}
													title="Sei il proprietario"
												/>
											)}
										</div>
										{note.ownerId === user?._id &&
											note.type === "note" && (
												<Button
													variant="link"
													className={styles.deleteBtn}
													onClick={() =>
														showConfirmToast(
															() =>
																handleDelete(
																	note._id!
																),
															note.summary
														)
													}
												>
													<FaTrash />
												</Button>
											)}
									</div>

									<Card.Body
										className={styles.cardBody}
										onClick={() => handleNoteClick(note)}
									>
										<div className={styles.noteHeader}>
											<Card.Title
												className={styles.noteTitle}
											>
												{note.summary ||
													"Untitled Note"}
											</Card.Title>
										</div>

										{note.categories && (
											<div
												className={styles.noteCategory}
											>
												{note.categories}
											</div>
										)}

										<div className={styles.noteContent}>
											{note.text ? (
												<Card.Text
													className={styles.noteText}
												>
													{note.text.length < 200
														? note.text
														: note.text.substring(
																0,
																200
															) + "..."}
												</Card.Text>
											) : (
												<div
													className={styles.emptyText}
												>
													<span
														className={
															styles.emptyIcon
														}
													>
														✏️
													</span>
													<p>
														Questa nota è vuota.
														Clicca per modificarla.
													</p>
												</div>
											)}
										</div>
									</Card.Body>
								</Card>
							))
						)}
					</div>
				)}
			</Container>
		</div>
	);
}
