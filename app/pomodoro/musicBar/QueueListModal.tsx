"use client";

import "@/app/chat/sideBar/Modal.css";
import React, { useState } from "react";
import { Button, Container, Form, ListGroup, Modal } from "react-bootstrap";
import YouTube, { YouTubeProps } from "react-youtube";

const opts: YouTubeProps["opts"] = {
	// https://developers.google.com/youtube/player_parameters
	playerVars: {
		vq: "small", // Qualità video
		controls: 0, // Nascondi i controlli del lettore
		disablekb: 1, // Disabilita i tasti della tastiera
		enablejsapi: 1, // Abilita l'API JavaScript
		iv_load_policy: 3, // Nascondi le annotazioni
		loop: 0,
		modestbranding: 1, // Nascondi il pulsante YouTube
		playsinline: 1, // Riproduci video in linea
		rel: 0, // Nascondi video correlati
		showinfo: 0 // Nascondi informazioni video
	}
};

interface ModalInteface {
	children: React.ReactNode;
	videoList: string[];
	setVideoList: React.Dispatch<React.SetStateAction<string[]>>;
	videoTitleList: string[];
	setVideoTitleList: React.Dispatch<React.SetStateAction<string[]>>;
}

export function QueueListModal({
	children,
	videoList,
	setVideoList,
	videoTitleList,
	setVideoTitleList
}: ModalInteface) {
	const [show, setShow] = useState(false);
	const [newVideo, setNewVideo] = useState("");
	const [curVideo, setCurVideo] = useState("");

	// TODO rimuovere quando finito canzone
	function handleNewVideoChange(e: any) {
		setNewVideo(e.target.value);
	}

	function handleAddNewVideo() {
		if (newVideo === "") {
			return;
		}
		const ytRegex =
			/^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})$/;

		const match = newVideo.match(ytRegex);
		if (!match) {
			alert("Link non valido");
			return;
		}
		const videoId = match[1];
		setCurVideo(videoId);
		setVideoList([...videoList, videoId]);
		setNewVideo("");
	}

	function onReady(event: any) {
		const player = event.target;
		const data = player.getVideoData();
		setVideoTitleList([...videoTitleList, data.title]);
		setCurVideo("");
	}

	function handleRemoveVideo(index: number) {
		setVideoTitleList(videoTitleList.filter((_, i) => i !== index));
		setVideoList(videoList.filter((_, i) => i !== index));
	}

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
							value={newVideo}
							onChange={handleNewVideoChange}
							placeholder="Inserisci link"
							className="input-field me-2"
						/>
						<Button onClick={handleAddNewVideo} variant="primary">
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
					></YouTube>
				)}
			</>
		);
	}

	return (
		<>
			{/* Bottone per aprire il modal */}
			<span onClick={() => setShow(true)} style={{ cursor: "pointer" }}>
				{children}
			</span>

			<Modal
				show={show}
				onHide={() => setShow(false)}
				centered
				dialogClassName="custom-modal"
				backdropClassName="custom-backdrop"
				fullscreen="lg-down"
			>
				<Modal.Header closeButton className="custom-modal-header">
					<Modal.Title>
						<i className="bi bi-person-plus me-2" />
						Coda Player
					</Modal.Title>
				</Modal.Header>
				<Modal.Body>{videoListBlock()}</Modal.Body>
				<Modal.Footer>
					<Button
						variant="secondary"
						onClick={() => setShow(false)}
						className="custom-cancel-button"
					>
						Annulla
					</Button>
				</Modal.Footer>
			</Modal>
		</>
	);
}
