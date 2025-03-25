"use client";

import { GlobalSideBar } from "@/app/components/GlobalSideBar";
import { useUser } from "@/app/components/UserContext";
import DOMPurify from "dompurify";
import { marked } from "marked";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, Col, Container, Form, Row } from "react-bootstrap";
import { FaEdit } from "react-icons/fa";
import useSWR from "swr";
import { EditNoteModal } from "./EditNoteModal";
import styles from "./Note.module.css";

async function fetcher(url: string) {
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error("Errore durante il fetch della nota");
	}
	return response.json();
}

const useWindowSize = () => {
	const [windowSize, setWindowSize] = useState({
		width: typeof window !== "undefined" ? window.innerWidth : 0
	});

	useEffect(() => {
		const handleResize = () => {
			setWindowSize({
				width: window.innerWidth
			});
		};

		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	return windowSize;
};

export default function Note() {
	const { width } = useWindowSize();
	const isMobile = width <= 768;

	const { user } = useUser();
	const params = useParams();
	const id = params.id;

	const {
		data: note,
		error,
		mutate
	} = useSWR(() => (id ? `/api/notepad/getNote?id=${id}` : null), fetcher);

	const [noteText, setNoteText] = useState("");
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
				await mutate();
				alert("Nota salvata con successo!");
			} else {
				alert("Errore durante il salvataggio della nota.");
			}
		} catch (error) {
			alert("Errore durante la comunicazione con l'API:" + error);
		}
	};

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
				await mutate();
				alert("Permessi aggiornati con successo!");
			} else {
				alert("Errore durante l'aggiornamento dei permessi.");
			}
		} catch (error) {
			alert("Errore durante la comunicazione con l'API:" + error);
		}
	};

	if (error) return <div>Errore durante il caricamento della nota.</div>;
	if (!note) return <div className={styles.loading}>Caricamento...</div>;

	const sanitizedMarkdown = DOMPurify.sanitize(
		marked(noteText, { async: false })
	);

	return (
		<div className={styles.container}>
			<GlobalSideBar />
			<Container className={`${styles.mainContainer} mt-3`}>
				<div className={styles.header}>
					<div className={styles.headerLeft}>
						<h1 className={styles.title}>{note.summary}</h1>
						{note.categories && (
							<div className={styles.categories}>
								<span className={styles.categoryBadge}>
									{note.categories}
								</span>
							</div>
						)}
					</div>

					<div className={styles.headerRight}>
						<div className={styles.buttonGroup}>
							{note.ownerId.toString() === user?._id && (
								<EditNoteModal
									note={note}
									currentUserId={user?._id}
									handleEdit={handleEdit}
								>
									<button className={styles.editButton}>
										<FaEdit size={24} />
									</button>
								</EditNoteModal>
							)}
							<Button
								variant="primary"
								onClick={handleSave}
								className={styles.saveButton}
							>
								Salva Modifiche
							</Button>
						</div>
					</div>
				</div>

				{isMobile && (
					<Row className={styles.toggleRow}>
						<Col>
							<Button
								variant="outline-primary"
								onClick={handleToggleView}
								className={styles.toggleButton}
							>
								{showMarkdown
									? "Mostra Editor"
									: "Mostra Anteprima"}
							</Button>
						</Col>
					</Row>
				)}

				<div className={styles.editorContainer}>
					{(!isMobile || !showMarkdown) && (
						<div className={styles.editorPane}>
							<Form.Control
								as="textarea"
								value={noteText}
								onChange={(e) => setNoteText(e.target.value)}
								placeholder="Scrivi qui la tua nota..."
								className={styles.textarea}
							/>
						</div>
					)}

					{(!isMobile || showMarkdown) && (
						<div className={styles.previewPane}>
							<div
								className={styles.previewContent}
								dangerouslySetInnerHTML={{
									__html: sanitizedMarkdown
								}}
							/>
						</div>
					)}
				</div>
			</Container>
		</div>
	);
}
