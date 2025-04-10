"use client";

import { StandardInput } from "@/app/components/StandardInput";
import { StandardModal } from "@/app/components/StandardModal";
import React, { useState } from "react";
import { toast } from "react-toastify";

interface ChatModalProps {
	updateChatList: () => void;
	children: any;
}

export function ChatModal({ updateChatList, children }: ChatModalProps) {
	const [show, setShow] = useState(false);
	const [form, setForm] = useState({
		username: ""
	});

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setForm({
			...form,
			[e.target.name]: e.target.value
		});
	};

	// Gestisce il submit del form
	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		const response = await fetch("/api/chat/add", {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({ receiver: form.username })
		});

		if (!response.ok) {
			toast.error("Errore durante la creazione della chat");
			return;
		}

		toast.success("Chat creata con successo");
		setShow(false);
		setForm({ username: "" });
		updateChatList();
	};

	return (
		<>
			{/* Bottone per aprire il modal */}
			<span onClick={() => setShow(true)} style={{ cursor: "pointer" }}>
				{children}
			</span>

			<StandardModal
				title="Nuova chat"
				titleIcon={<i className="bi bi-chat me-2" />}
				saveBtnText="Crea"
				show={show}
				handleClose={() => setShow(false)}
				handleSubmit={handleSubmit}
			>
				<StandardInput
					type="text"
					name="username"
					title="Nome dell'utente"
					value={form.username}
					onChange={handleChange}
					placeholder="Inserisci nome"
				/>
			</StandardModal>
		</>
	);
}
