"use client";

import { GlobalSideBar } from "@/app/components/GlobalSideBar";
import { useUser } from "@/app/components/UserContext";
import { StringNote } from "@/utils/db/db";
import React, { useEffect, useState } from "react";
import { Button, Card, Col, Container, Row } from "react-bootstrap";
import { FaLock, FaTrash, FaUser, FaUserShield } from "react-icons/fa";
import { MdPublic } from "react-icons/md";
import useSWR from "swr";
import styles from "./Notepad.module.css";
import { SearchBar } from "./SearchBar";

async function fetcher(url: string) {
	const response = await fetch(url);
	if (!response.ok) {
		alert("Errore durante il fetch delle note!");
	}
	return response.json();
}

export default function Notepad() {
	const { user } = useUser();

	const [notes, setNotes] = useState<StringNote[]>([]);
	const [oldNotes, setOldNotes] = useState<StringNote[]>([]);

	const { data, error } = useSWR("/api/notepad/getNotes", fetcher);

	// Aggiorna notes quando i dati vengono recuperati
	useEffect(() => {
		if (data) {
			setOldNotes(data);
			setNotes(data);
		}
	}, [data]);

	function handleFilters(filters: any) {
		setOldNotes(notes);

		console.log(filters);

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
		console.log(note);

		const response = await fetch("/api/notepad/add", {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify(note)
		});
		if (!response.ok) {
			alert("Errore durante il fetch delle note!");
		} else {
			const fetched_data = await response.json();
			window.location.href = "./notepad/" + fetched_data._id;
		}
	}

	async function handleDelete(id: string) {
		const conf = confirm("Sicuro di voler eliminare?");

		if (!conf) return;

		const response = await fetch("/api/notepad/delete", {
			method: "DELETE",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({ _id: id })
		});

		if (!response.ok) {
			alert("Errore nell'eliminazione della nota!");
		}

		window.location.reload();
	}

	// Funzione per restituire l'icona corretta per il campo access
	function getAccessIcon(access: string) {
		switch (access) {
			case "PRIVATE":
				return <FaLock title="Private" />;
			case "INVITED":
				return <FaUser title="Invited" />;
			case "PUBLIC":
				return <MdPublic title="Public" />;
			default:
				return null;
		}
	}

	// Funzione per verificare se l'utente è il proprietario della nota
	function isOwner(ownerId: string) {
		return ownerId === user?._id;
	}

	function handleNoteClick(note: any) {
		sessionStorage.setItem("selectedNote", JSON.stringify(note));
		window.location.href = "./notepad/" + note._id;
	}

	return (
		<>
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

				{error && <div>Failed to load</div>}
				{!data ? (
					<div className={styles.loadingState}>Loading notes...</div>
				) : (
					<div className={styles.notesGrid}>
						{notes.length === 0 ? (
							<div className={styles.emptyState}>
								<p>
									No notes found. Start by creating a new one!
								</p>
							</div>
						) : (
							notes.map((note: StringNote) => (
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
											{isOwner(note.ownerId) && (
												<FaUserShield
													className={`${styles.icon} ${styles.ownerIcon}`}
													title="Owner"
												/>
											)}
										</div>
										<Button
											variant="link"
											className={styles.deleteBtn}
											onClick={() =>
												handleDelete(note._id!)
											}
										>
											<FaTrash />
										</Button>
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
														This note is empty.
														Click to start writing!
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
		</>
	);
}
