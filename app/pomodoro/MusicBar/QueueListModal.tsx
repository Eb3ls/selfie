"use client";

// Import necessari per il componente
import React, { useState } from "react";
import { Button, Container, Form, ListGroup, Modal } from "react-bootstrap";
import { FaMusic } from "react-icons/fa6";
import YouTube, { YouTubeProps } from "react-youtube";
import "./MusicBar.css";

// Opzioni di configurazione per il player YouTube
// Disabilita la maggior parte dei controlli e delle funzionalità interattive
const opts: YouTubeProps["opts"] = {
	// https://developers.google.com/youtube/player_parameters
	playerVars: {
		vq: "small", // Qualità video
		controls: 0, // Nascondi i controlli del lettore
		disablekb: 1, // Disabilita i tasti della tastiera
		enablejsapi: 0, // Abilita l'API JavaScript
		iv_load_policy: 3, // Nascondi le annotazioni
		loop: 0,
		modestbranding: 1, // Nascondi il pulsante YouTube
		playsinline: 1, // Riproduci video in linea
		rel: 0, // Nascondi video correlati
		showinfo: 0 // Nascondi informazioni video
	}
};

// Interfaccia per le props del componente
// Definisce la struttura dati necessaria per gestire la lista di video
interface ModalInteface {
	children: React.ReactNode;
	videoList: string[];
	setVideoList: React.Dispatch<React.SetStateAction<string[]>>;
	videoTitleList: string[];
	setVideoTitleList: React.Dispatch<React.SetStateAction<string[]>>;
}

// Componente principale per la gestione della coda di riproduzione musicale
export function QueueListModal({
	children,
	videoList,
	setVideoList,
	videoTitleList,
	setVideoTitleList
}: ModalInteface) {
	// Stati locali per gestire il modale e i video
	const [show, setShow] = useState(false);         // Controlla visibilità del modale
	const [newVideo, setNewVideo] = useState("");    // Input per nuovo video
	const [curVideo, setCurVideo] = useState("");    // Video attualmente in caricamento

	// Gestisce il cambio di input nel campo nuovo video
	function handleNewVideoChange(e: any) {
		setNewVideo(e.target.value);
	}

	// Aggiunge un nuovo video alla coda
	// Valida il link YouTube e estrae l'ID del video
	function handleAddNewVideo() {
		if (newVideo === "") {
			return;
		}
		const ytRegex =
			/^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})(?:[?&].*)?$/;

		const match = newVideo.match(ytRegex);
		if (!match) {
			alert("Link non valido");
			return;
		}
		const videoId = match[1];
		setCurVideo(videoId);
		setVideoList([...videoList, videoId]);
		setVideoTitleList([...videoTitleList, "Caricamento..."]);
		setNewVideo("");
	}

	// Callback eseguita quando un video è pronto
	// Aggiorna il titolo del video nella lista
	function onReady(event: any) {
		const player = event.target;
		const data = player.getVideoData();
		const list = [...videoTitleList];
		list[list.length - 1] = data.title;
		setVideoTitleList(list);
		setCurVideo("");
	}

	// Rimuove un video dalla coda
	function handleRemoveVideo(index: number) {
		setVideoTitleList(videoTitleList.filter((_, i) => i !== index));
		setVideoList(videoList.filter((_, i) => i !== index));
	}

	// Gestisce la chiusura del modale
	// Impedisce la chiusura se un video è in caricamento
	function handleClose() {
		if (curVideo !== "") {
			alert("Aspetta che il video sia pronto");
			return;
		}
		setShow(false);
	}

	// Renderizza un singolo elemento della lista video
	function videoItem(videoTitle: string, index: number) {
		return (
			<ListGroup.Item
				key={index}
				className="d-flex justify-content-between align-items-center text-break"
			>
				{videoTitle}
				<Button
					variant="danger"
					size="sm"
					onClick={() => handleRemoveVideo(index)}
				>
					X
				</Button>
			</ListGroup.Item>
		);
	}

	// Renderizza il blocco principale della lista video
	// Include form di input e lista dei video in coda
	function videoListBlock() {
		return (
			<>
				<Form.Group className="mb-3 align-items-center">
					<Form.Label className="me-2">
						Aggiungi link youtube
					</Form.Label>
					<Container className="d-flex p-0">
						<Form.Control
							type="text"
							name="userName"
							autoFocus
							value={newVideo}
							onChange={handleNewVideoChange}
							placeholder="Inserisci link"
							className="input-field me-2"
						/>
						<Button
							onClick={handleAddNewVideo}
							className="bg-brown"
						>
							Aggiungi
						</Button>
					</Container>
				</Form.Group>
				{videoList.length > 0 && (
					<>
						<Form.Label className="mb-2">Video in coda</Form.Label>
						<ListGroup
							className="mt-3 overflow-y-auto"
							style={{ maxHeight: "40vh" }}
						>
							{videoTitleList.map((video, index) =>
								videoItem(video, index)
							)}
						</ListGroup>
					</>
				)}
				{curVideo !== "" && (
					<YouTube
						videoId={curVideo}
						onReady={onReady}
						opts={opts}
						className="d-none"
						frameBorder="0"
						Allow="autoplay; encrypted-media; picture-in-picture;"
					></YouTube>
				)}
			</>
		);
	}

	// Template principale del componente
	return (
		<>
			<span onClick={() => setShow(true)} style={{ cursor: "pointer" }}>
				{children}
			</span>

			<Modal
				show={show}
				onHide={handleClose}
				centered
				dialogClassName="custom-modal"
				backdropClassName="custom-backdrop"
				fullscreen="lg-down"
			>
				<Modal.Header
					closeButton
					className="custom-modal-header bg-primary-green"
				>
					<Modal.Title>
						<FaMusic className="me-2" fill="white"></FaMusic>
						Coda Player
					</Modal.Title>
				</Modal.Header>
				<Modal.Body>{videoListBlock()}</Modal.Body>
				<Modal.Footer>
					<Button
						variant="secondary"
						onClick={handleClose}
						className="custom-cancel-button"
					>
						Chiudi
					</Button>
				</Modal.Footer>
			</Modal>
		</>
	);
}
