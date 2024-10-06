"use client";

import { Sidebar } from "@/app/components/Sidebar";
import { marked } from "marked";
import { useEffect, useState } from "react";
import { Button, Col, Container, Form, Row } from "react-bootstrap";
import { FaEdit } from "react-icons/fa";
import { EditNoteModal } from "./EditNoteModal";

export default function Note() {
	const [note, setNote] = useState<any>(null);
	const [noteText, setNoteText] = useState(""); // Inizializza con stringa vuota
	const [showMarkdown, setShowMarkdown] = useState(false);

	useEffect(() => {
		// Recupera l'item dalla sessionStorage
		const storedNote = sessionStorage.getItem("selectedNote");
		if (storedNote) {
			const parsedNote = JSON.parse(storedNote);
			setNote(parsedNote);
			setNoteText(parsedNote.text); // Imposta il testo della nota
		}
	}, []);

	const handleToggleView = () => {
		setShowMarkdown(!showMarkdown);
	};

	const handleSave = async () => {
		try {
			const response = await fetch("/api/notepad/modifyText", {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({
					_id: note._id,
					text: noteText
				})
			});
			if (response.ok) {
				sessionStorage.setItem("selectedNote", JSON.stringify(note));
				// Aggiorna la nota salvata nella sessionStorage o gestisci il feedback di successo
				alert("Nota salvata con successo!");
			} else {
				alert("Errore durante il salvataggio della nota.");
			}
		} catch (error) {
			alert("Errore durante la comunicazione con l'API:" + error);
		}
	};

	// Se la nota non è ancora caricata, mostra un messaggio di caricamento
	if (!note) {
		return <div>Loading...</div>;
	}

	function handleEdit() {}

	return (
		<Container>
			<Sidebar />
			<Row className="my-5">
				<Col md={10} className="mt-0 mt-4 mt-sm-2">
					{/* Aggiunta la classe condizionale */}
					<h1
						style={{
							display: "inline-block",
							marginRight: "10px",
							verticalAlign: "middle"
						}}
					>
						{note.summary}
					</h1>
					<EditNoteModal
						note={note}
						currentUserId={"66bf4fe07cbfb6be046fcda1"}
						handleEdit={handleEdit}
					>
						<Button
							variant="light"
							className="align-self-center"
							onClick={() => {
								/* Apertura modale gestione in futuro */
							}}
						>
							<FaEdit />
						</Button>
					</EditNoteModal>
					{/* Categorie sotto il titolo */}
					<div className="categories" style={{ marginTop: "10px" }}>
						<strong>Categorie: </strong>
						{note.categories}
					</div>
				</Col>
			</Row>

			<Row className="d-flex">
				{/* Tastino per il cambio di vista (solo per sm) */}
				<Button
					variant="link"
					onClick={handleToggleView}
					className="d-block d-md-none mt-0"
				>
					{showMarkdown ? "Visualizza Input" : "Visualizza Nota"}
				</Button>
				{/* Colonna con l'input text */}
				<Col md={6} className="d-none d-md-block">
					<Form.Control
						as="textarea"
						rows={10}
						value={noteText}
						onChange={(e) => setNoteText(e.target.value)}
						placeholder="Scrivi qui la tua nota..."
						style={{
							resize: "none", // Disabilita il ridimensionamento
							height: "100%" // Imposta l'altezza al 100%
						}}
					/>
				</Col>

				{/* Colonna con il testo in markdown */}
				<Col md={6} className="d-none d-md-block d-flex">
					<div
						className="preview"
						dangerouslySetInnerHTML={{ __html: marked(noteText) }}
						style={{
							border: "1px solid #ccc",
							padding: "10px",
							borderRadius: "5px",
							height: "100%",
							overflowY: "auto",
							flexGrow: 1 // Permette al rettangolo di espandersi per occupare l'altezza disponibile
						}}
					/>
				</Col>

				{/* Colonna per dimensioni small */}
				<Col sm={12} className="d-block d-md-none">
					{showMarkdown ? (
						<div
							className="preview"
							dangerouslySetInnerHTML={{
								__html: marked(noteText)
							}}
							style={{
								border: "1px solid #ccc",
								padding: "10px",
								borderRadius: "5px",
								height: "100%",
								overflowY: "auto"
							}}
						/>
					) : (
						<Form.Control
							as="textarea"
							rows={10}
							value={noteText}
							onChange={(e) => setNoteText(e.target.value)}
							placeholder="Scrivi qui la tua nota..."
							style={{
								resize: "none",
								height: "100%"
							}}
						/>
					)}
				</Col>
			</Row>

			{/* Pulsante Save */}
			<Row className="mt-3">
				<Col>
					<Button variant="primary" onClick={handleSave}>
						Save
					</Button>
				</Col>
			</Row>
		</Container>
	);
}
