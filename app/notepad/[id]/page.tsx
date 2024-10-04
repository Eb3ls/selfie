"use client";

// pages/note.js
import { Sidebar } from "@/app/components/Sidebar";
import { marked } from "marked";
import { useState } from "react";
import { Button, Col, Container, Form, Row } from "react-bootstrap";
import { FaEdit } from "react-icons/fa";

const user = {
	_id: "66bf4fe07cbfb6be046fcda1",
	username: "prova",
	firstName: "prova",
	lastName: "prova",
	email: "prova",
	password:
		"6258a5e0eb772911d4f92be5b5db0e14511edbe01d1d0ddd1d5a2cb9db9a56ba",
	birthDay: null,
	userStatus: "Attivo",
	profilePic: "/images/?.png",
	isResource: false,
	pomodoro: {
		_id: {
			$oid: "66bf4fdf7cbfb6be046fcda0"
		},
		cycles: 4,
		cyclesCompleted: 0,
		studyDuration: 25,
		breakDuration: 5,
		alarms: []
	}
};

const sampleText = `# This is a header

## This is a subheader

This is a paragraph

- Item 1
- Item 2
- Item 3	

### Sezione con Tabelle

| Intestazione 1 | Intestazione 2 |
|----------------|----------------|
| Riga 1         | Riga 1         |
| Riga 2         | Riga 2         |

### Link e Immagini

Puoi trovare più informazioni su [Markdown](https://www.markdownguide.org/) qui.

![Esempio di Immagine](https://via.placeholder.com/150)

### Citazioni

> Questo è un esempio di citazione.
`;

async function fetcher(url: string) {
	const response = await fetch(url);
	if (!response.ok) {
		alert("Errore durante il fetch delle note!");
	}
	return response.json();
}

export default function Note({ params }: any) {
	const [noteText, setNoteText] = useState(sampleText);
	const [showMarkdown, setShowMarkdown] = useState(false);

	const handleToggleView = () => {
		setShowMarkdown(!showMarkdown);
	};

	return (
		<Container>
			<Sidebar />
			<Row className="my-3">
				<Col md={10}>
					<h1
						style={{
							display: "inline-block",
							marginRight: "10px",
							verticalAlign: "middle"
						}}
					>
						Nota
					</h1>
					<Button
						variant="light"
						className="align-self-center"
						onClick={() => {
							/* Apertura modale gestione in futuro */
						}}
					>
						<FaEdit />
					</Button>
					{/* Categorie sotto il titolo */}
					<div className="categories" style={{ marginTop: "10px" }}>
						<strong>Categorie:</strong>{" "}
						<span>Categoria1, Categoria2</span>
					</div>
				</Col>
			</Row>

			<Row className="d-flex">
				<Col md={6}>
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

				<Col md={6} className="d-flex">
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
			</Row>

			{/* Tastino per il cambio di vista (mobile) */}
			<Button variant="link" onClick={handleToggleView}>
				{showMarkdown ? "Visualizza Input" : "Visualizza Nota"}
			</Button>
		</Container>
	);
}
