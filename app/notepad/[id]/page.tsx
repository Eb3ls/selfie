"use client";

import { GlobalSideBar } from "@/app/components/GlobalSideBar";
import DOMPurify from "dompurify";
import { marked } from "marked";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, Col, Container, Form, Row } from "react-bootstrap";
import { FaEdit } from "react-icons/fa";
import useSWR from "swr";
import { EditNoteModal } from "./EditNoteModal";

// TODO: utente da cookie

// Funzione fetcher per SWR
async function fetcher(url: string) {
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error("Errore durante il fetch della nota");
	}
	return response.json();
}

export default function Note() {
	const params = useParams();
	const id = params.id;

	const {
		data: note,
		error,
		mutate
	} = useSWR(() => (id ? `/api/notepad/getNote?id=${id}` : null), fetcher);

	const [noteText, setNoteText] = useState(""); // Inizializza con stringa vuota
	const [showMarkdown, setShowMarkdown] = useState(false);

	useEffect(() => {
		if (note) {
			setNoteText(note.text);
		}
	}, [note]);

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
				await mutate(); // Refetch dei dati per aggiornare la visualizzazione
				alert("Nota salvata con successo!");
			} else {
				alert("Errore durante il salvataggio della nota.");
			}
		} catch (error) {
			alert("Errore durante la comunicazione con l'API:" + error);
		}
	};

	// Funzione per modificare i permessi della nota
	const handleEdit = async (body: {
		_id: string;
		summary: string;
		categories: string;
		access: string;
		usernameList: [string];
	}) => {
		try {
			const response = await fetch("/api/notepad/modifyPermission", {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify(body)
			});
			if (response.ok) {
				await mutate(); // Refetch dei dati per aggiornare la visualizzazione
				alert("Permessi aggiornati con successo!");
			} else {
				alert("Errore durante l'aggiornamento dei permessi.");
			}
		} catch (error) {
			alert("Errore durante la comunicazione con l'API:" + error);
		}
	};

	// Se c'è un errore durante il fetch o i dati non sono ancora caricati, mostra messaggio appropriato
	if (error) return <div>Errore durante il caricamento della nota.</div>;
	if (!note) return <div>Loading...</div>;

	// Sanifica il contenuto markdown
	const sanitizedMarkdown = DOMPurify.sanitize(
		marked(noteText, { async: false })
	);

	return (
		<Container>
			<GlobalSideBar />
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
						dangerouslySetInnerHTML={{ __html: sanitizedMarkdown }}
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
								__html: sanitizedMarkdown
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
