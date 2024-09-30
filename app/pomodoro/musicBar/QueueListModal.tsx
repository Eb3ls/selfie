"use client";

import "@/app/chat/sideBar/Modal.css";
import React, { useState } from "react";
import { Button, Container, Form, ListGroup, Modal } from "react-bootstrap";

export function QueueListModal({ children }: any) {
	const [show, setShow] = useState(false);
	const [newVideo, setNewVideo] = useState("");
	const [videoList, setVideoList] = useState<string[]>([]);

	// TODO rimuovere quando finito canzone
	const handleNewVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setNewVideo(e.target.value);
	};

	const handleAddNewVideo = () => {
		if (newVideo === "") {
			return;
		}
		setVideoList([...videoList, newVideo]);
		setNewVideo("");
	};

	// TODO possono essere ripetuti
	const handleRemoveVideo = (name: string) => {
		setVideoList(videoList.filter((video) => video !== name));
	};

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
					onClick={() => handleRemoveVideo(videoTitle)}
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
							{videoList.map((video, index) =>
								videoItem(video, index)
							)}
						</ListGroup>
					</>
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
