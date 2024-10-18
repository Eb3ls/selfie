"use client";

import { Sidebar } from "@/app/components/Sidebar";
import DOMPurify from "dompurify";
import { marked } from "marked";
// Importa DOMPurify
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, Col, Container, Form, Row } from "react-bootstrap";
import { FaEdit } from "react-icons/fa";
import { EditNoteModal } from "./EditNoteModal";

export default function Note() {
	const params = useParams();
	const id = params.id;

	const [note, setNote] = useState<any>(null);
	const [noteText, setNoteText] = useState(""); // Inizializza con stringa vuota
	const [showMarkdown, setShowMarkdown] = useState(false);

	useEffect(() => {
		if (!id) return;

		// Prendi la nota con api getNote con fetch
		fetch(`/api/notepad/getNote?id=${id}`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json"
			}
		})
			.then((response) => response.json())
			.then((data) => {
				setNote(data);
				setNoteText(data.text);
			})
			.catch((error) => {
				console.error("Errore durante il fetch della nota:", error);
			});
	}, [id]);

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

	// Sanifica il contenuto markdown
	const sanitizedMarkdown = DOMPurify.sanitize(marked(noteText));

	return (
		<Container>
			<Sidebar />
			<Row className="my-5">
				<Col md={10} className="mt-0 mt-4 mt-sm-2">
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
				<Button
					variant="link"
					onClick={handleToggleView}
					className="d-block d-md-none mt-0"
				>
					{showMarkdown ? "Visualizza Input" : "Visualizza Nota"}
				</Button>
				<Col md={6} className="d-none d-md-block">
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
				</Col>

				<Col md={6} className="d-none d-md-block d-flex">
					<div
						className="preview"
						dangerouslySetInnerHTML={{ __html: sanitizedMarkdown }} // Usa il contenuto sanificato
						style={{
							border: "1px solid #ccc",
							padding: "10px",
							borderRadius: "5px",
							height: "100%",
							overflowY: "auto",
							flexGrow: 1
						}}
					/>
				</Col>

				<Col sm={12} className="d-block d-md-none">
					{showMarkdown ? (
						<div
							className="preview"
							dangerouslySetInnerHTML={{
								__html: sanitizedMarkdown // Usa il contenuto sanificato
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
