"use client";

import { GlobalSideBar } from "@/app/components/GlobalSideBar";
import { useUser } from "@/app/components/UserContext";
import { generalFetcher, safeFetch } from "@/utils/fetch/fetch";
import DOMPurify from "dompurify";
import { marked } from "marked";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, Container, Form } from "react-bootstrap";
import { toast } from "react-toastify";
import useSWR from "swr";
import { NoteHeader } from "./NoteHeader";

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

function categoriesBlock(categories: string) {
	if (!categories) {
		return <div style={{ minHeight: "44px" }}></div>;
	}

	const categoriesArray = categories.split(",").map((cat) => cat.trim());

	const block = categoriesArray.map((cat, index) => (
		<span
			className="rounded-pill px-2 py-1"
			key={index}
			style={{
				background: "rgba(39, 174, 96, 0.08)",
				color: "#27ae60",
				border: "1px solid rgba(39, 174, 96, 0.15)",
				fontSize: "0.75rem",
				fontWeight: 500
			}}
		>
			{cat}
		</span>
	));

	return (
		<div className="rounded-3 p-2 d-flex gap-2 flex-nowrap overflow-auto hide-scrollbar flex-shrink-0">
			{block}
		</div>
	);
}

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
	} = useSWR<noteData>(
		() => (id ? `/api/notepad/getNote?id=${id}` : null),
		generalFetcher
	);

	useEffect(() => {
		if (rawNote) {
			setNote(rawNote);
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
		const response = await safeFetch(
			fetch("/api/notepad/modifyText", {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({
					_id: note!._id,
					text: noteText
				})
			})
		);
		if (response.ok) {
			toast.success("Nota salvata con successo!");
			mutate();
		} else {
			toast.error("Errore durante il salvataggio della nota");
		}
	};

	if (error)
		return (
			<div className="dvh-100 overflow-auto bg-light">
				<GlobalSideBar />
				<Container>
					<div className="d-flex flex-column align-items-center justify-content-center h-100 mt-3">
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
			<div className="dvh-100 overflow-auto bg-light">
				<GlobalSideBar />
				<Container>
					<div className="d-flex flex-column align-items-center justify-content-center h-100 mt-3">
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
		<div className="dvh-100 d-flex flex-column overflow-auto bg-light">
			<GlobalSideBar />
			<Container
				className="py-3 d-flex flex-column flex-grow-1"
				style={{ minHeight: 0 }}
			>
				<NoteHeader
					ownerId={note.ownerId.toString()}
					userId={user?._id?.toString()}
					summary={note.summary}
					note={note}
					mutate={mutate}
					handleSave={handleSave}
				/>

				{categoriesBlock(note.categories)}

				{isMobile && (
					<div className="my-3 d-flex justify-content-center flex-shrink-0">
						<Button
							variant="outline-primary"
							onClick={handleToggleView}
						>
							{showMarkdown
								? "Mostra Editor"
								: "Mostra Anteprima"}
						</Button>
					</div>
				)}

				<div
					className="d-flex mt-3 flex-grow-1 gap-3"
					style={{ minHeight: 0 }}
				>
					{(!isMobile || !showMarkdown) && (
						<Form.Control
							as="textarea"
							value={noteText}
							onChange={(e) => setNoteText(e.target.value)}
							placeholder="Scrivi qui la tua nota..."
							className="p-3 border rounded shadow-sm overflow-auto bg-white"
							style={{
								flexBasis: 0,
								flexGrow: 1,
								resize: "none"
							}}
						/>
					)}
					{(!isMobile || showMarkdown) && (
						<div
							className="p-3 border rounded shadow-sm overflow-auto bg-white"
							style={{
								flexBasis: 0,
								flexGrow: 1
							}}
							dangerouslySetInnerHTML={{
								__html: sanitizedMarkdown
							}}
						/>
					)}
				</div>
			</Container>
		</div>
	);
}
