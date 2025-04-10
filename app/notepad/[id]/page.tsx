"use client";

import { GlobalSideBar } from "@/app/components/GlobalSideBar";
import { useUser } from "@/app/components/UserContext";
import DOMPurify from "dompurify";
import { marked } from "marked";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, Col, Container, Form, Row } from "react-bootstrap";
import { FaGear } from "react-icons/fa6";
import { toast } from "react-toastify";
import useSWR from "swr";
import { EditNoteModal } from "./EditNoteModal";
import styles from "./Note.module.css";

type noteData = {
	_id?: string;
	ownerId: string;
	summary: string;
	categories: string;
	text: string;
	length: number;
	access: "PRIVATE" | "INVITED" | "PUBLIC";
	dtStamp: string;
	dtModified: string;
	activityIdList: string[];
	usernameList: string[] | undefined;
};

async function fetcher(url: string) {
	const response = await fetch(url);
	if (!response.ok) {
		toast.error("Errore durante il recupero della nota!");
		return;
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

	const [note, setNote] = useState<noteData | undefined>(undefined);

	const {
		data: rawNote,
		error,
		mutate
	} = useSWR(() => (id ? `/api/notepad/getNote?id=${id}` : null), fetcher);

	useEffect(() => {
		if (rawNote) {
			const noteData = rawNote;
			setNote(noteData);
		}
	}, [rawNote]);

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
					_id: note!._id,
					text: noteText
				})
			});
			if (response.ok) {
				toast.success("Nota salvata con successo!");
				mutate();
			} else {
				toast.error("Errore durante il salvataggio della nota");
			}
		} catch (error) {
			toast.error("Errore durante il salvataggio della nota");
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
				toast.success("Permessi aggiornati con successo!");
				mutate();
			} else {
				toast.error("Errore durante l'aggiornamento dei permessi");
			}
		} catch (error) {
			toast.error("Errore durante l'aggiornamento dei permessi");
		}
	};

	if (error)
		return (
			<div className={styles.container}>
				<GlobalSideBar />
				<Container className={`${styles.mainContainer} mt-3`}>
					<div className="d-flex flex-column align-items-center justify-content-center h-100">
						<h1 className="display-4 text-danger mb-3">
							Nota non valida
						</h1>
						<p className="text-muted">
							La nota che stai cercando di visualizzare non è
							accessibile o non esiste.
						</p>
						<Button href="/home" variant="primary" className="mt-3">
							Torna alla home
						</Button>
					</div>
				</Container>
			</div>
		);
	if (!note)
		return (
			<div className={styles.container}>
				<GlobalSideBar />
				<Container className={`${styles.mainContainer} mt-3`}>
					<div className="d-flex flex-column align-items-center justify-content-center h-100">
						<div
							className="spinner-border text-primary mb-3"
							role="status"
						>
							<span className="visually-hidden">
								Caricamento...
							</span>
						</div>
						<h2 className="h4 text-muted">Caricamento...</h2>
					</div>
				</Container>
			</div>
		);

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
										<FaGear size={24} />
									</button>
								</EditNoteModal>
							)}
							<Button
								variant="primary"
								onClick={handleSave}
								className={styles.saveButton}
							>
								Salva
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
