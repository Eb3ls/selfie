"use client";

import { Sidebar } from "@/app/components/Sidebar";
import { StringNote } from "@/utils/db/db";
import React, { useEffect, useState } from "react";
import { Button, Card, Col, Container, Row } from "react-bootstrap";
import { FaLock, FaTrash, FaUser, FaUserShield } from "react-icons/fa";
import { MdPublic } from "react-icons/md";
import useSWR from "swr";
import { SearchBar } from "./SearchBar";

// Variabile provvisoria per simulare l'utente corrente
const currentUser = "provvisoryUserId";

function onAdd() {}
function onSort() {}
function onFilter() {}
function handleDelete(id: string) {}

async function fetcher(url: string) {
	const response = await fetch(url);
	if (!response.ok) {
		alert("Errore durante il fetch delle note!");
	}
	return response.json();
}

export default function Notepad() {
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
		return ownerId === currentUser;
	}

	return (
		<>
			<Sidebar />
			<Container fluid="sm" className="mt-5 text-center px-5">
				<h1 className="mb-5">Notepad</h1>
				<SearchBar
					handleFilters={handleFilters}
					handleSort={handleSort}
					handleSearch={handleSearch}
				/>
				<Row className="mt-5 gx-5 text-center">
					{error && <div>Failed to load</div>}
					{!data && <div>Loading...</div>}
					{data &&
						notes.map((note: StringNote) => (
							<Col
								key={note._id}
								className="col-12 col-md-6 col-lg-4 mb-3"
							>
								<Card>
									<Card.Body>
										{/* Icone access e owner in alto a sinistra */}
										<div className="d-flex justify-content-start align-items-center p-2 rounded">
											{getAccessIcon(note.access)}
											{isOwner(note.ownerId) && (
												<FaUserShield
													className="ms-2"
													title="Owner"
												/>
											)}
											<Button
												variant="danger"
												className="ms-2 p-0"
												onClick={() =>
													handleDelete(note._id!)
												}
												style={{
													border: "none",
													backgroundColor:
														"transparent",
													color: "inherit" // Assicurati che il colore dell'icona sia visibile
												}}
											>
												<FaTrash title="Delete" />
											</Button>
										</div>
										<hr />
										<div className="d-flex justify-content-between align-items-center">
											<Card.Title>
												{note.summary}
											</Card.Title>
										</div>
										<div className="d-flex justify-content-between align-items-center">
											<Card.Subtitle className="mb-2 text-muted">
												{note.categories}
											</Card.Subtitle>
										</div>
										<hr />
										<Card.Text>
											{note.text.length < 200
												? note.text
												: note.text.substring(0, 200) +
													"..."}
										</Card.Text>
									</Card.Body>
								</Card>
							</Col>
						))}
				</Row>
			</Container>
		</>
	);
}
