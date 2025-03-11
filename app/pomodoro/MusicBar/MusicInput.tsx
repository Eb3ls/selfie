"use client";

// Import necessari per il componente
import React, { useState } from "react";
import { Button, Form } from "react-bootstrap";
import { FaPlus } from "react-icons/fa";
import YouTube, { YouTubeProps } from "react-youtube";

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
	videoList: string[];
	setVideoList: React.Dispatch<React.SetStateAction<string[]>>;
	videoTitleList: string[];
	setVideoTitleList: React.Dispatch<React.SetStateAction<string[]>>;
}

// Componente principale per la gestione della coda di riproduzione musicale
export function MusicInput({
	videoList,
	setVideoList,
	videoTitleList,
	setVideoTitleList
}: ModalInteface) {
	// Stati locali per gestire il modale e i video
	const [newVideo, setNewVideo] = useState(""); // Input per nuovo video
	const [curVideo, setCurVideo] = useState(""); // Video attualmente in caricamento
	const [error, setError] = useState(""); // Eventuali errori

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
		setError("");
		if (videoTitleList[videoTitleList.length - 1] === "Caricamento...") {
			setError("Attendere il caricamento dell'ultimo video");
			return;
		}

		const ytRegex =
			/^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})(?:[?&].*)?$/;

		const match = newVideo.match(ytRegex);
		if (!match) {
			setError("Link non valido");
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

	return (
		<>
			<Form.Group className="d-flex flex-column align-items-center mt-4">
				<Form.Label className="mb-3 fs-5 fw-bold text-primary">
					Add YouTube Track
				</Form.Label>
				<div className="d-flex w-100 shadow-sm position-relative">
					<Form.Control
						type="text"
						value={newVideo}
						onChange={handleNewVideoChange}
						placeholder="Paste YouTube URL here..."
						className="py-3 border-primary"
						style={{ borderRadius: "12px 0 0 12px" }}
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								handleAddNewVideo();
							}
						}}
					/>
					<Button
						onClick={handleAddNewVideo}
						className="px-4 btn-primary"
						style={{
							borderRadius: "0 12px 12px 0",
							transition: "all 0.2s ease"
						}}
					>
						<FaPlus size={18} />
					</Button>
				</div>
				{error && (
					<div className="text-danger fw-semibold fs-6 mt-2 d-flex align-items-center">
						{error}
					</div>
				)}
			</Form.Group>
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
