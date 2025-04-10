"use client";

import { StandardModal } from "@/app/components/StandardModal";
import React, { useState } from "react";
import { toast } from "react-toastify";

interface DeleteModalProps {
	chat_id: string;
	setSelectedChat: any;
	updateChatList: () => void;
	children: any;
}

export function DeleteModal({
	chat_id,
	setSelectedChat,
	updateChatList,
	children
}: DeleteModalProps) {
	const [show, setShow] = useState(false);

	// Gestisce il submit del form
	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		event.stopPropagation();

		setSelectedChat(null);

		const response = await fetch("/api/chat/delete", {
			method: "DELETE",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({ _id: chat_id })
		});

		if (!response.ok) {
			toast.error("Errore durante l'eliminazione della chat");
			return;
		}

		toast.success("Chat eliminata con successo");
		updateChatList();
	};

	const handleClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		setShow(true);
	};

	return (
		<div
			onClick={(e: any) => {
				e.stopPropagation();
			}}
		>
			{/* Bottone per aprire il modal */}
			<span onClick={handleClick} style={{ cursor: "pointer" }}>
				{children}
			</span>

			<StandardModal
				title="Elimina chat"
				titleIcon={<i className="bi bi-person-plus me-2" />}
				saveBtnText="Cancella"
				show={show}
				handleClose={() => {
					setShow(false);
				}}
				handleSubmit={handleSubmit}
			>
				<div>Sei sicuro di voler eliminare questa chat?</div>
			</StandardModal>
		</div>
	);
}
