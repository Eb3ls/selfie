"use client";

import { StandardInput } from "@/app/components/StandardInput";
import { StandardModal } from "@/app/components/StandardModal";
import { StandardUsersInput } from "@/app/components/StandardUsersInput";
import { safeFetch } from "@/utils/fetch/fetch";
import React, { useState } from "react";
import { FaUserGroup } from "react-icons/fa6";
import { toast } from "react-toastify";

interface GroupChatModalProps {
	updateChatList: () => void;
	setShowOptions: React.Dispatch<React.SetStateAction<boolean>>;
	children: any;
}

export function GroupChatModal({
	updateChatList,
	setShowOptions,
	children
}: GroupChatModalProps) {
	const [show, setShow] = useState(false);
	const [groupName, setGroupName] = useState("");
	const [users, setUsers] = useState<string[]>([]);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setGroupName(e.target.value);
	};

	// Gestisce il submit del form
	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		const response = await safeFetch(
			fetch("/api/chat/addGroup", {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({
					summary: groupName,
					usernameList: users
				})
			})
		);

		if (!response.ok) {
			toast.error("Errore durante la creazione del gruppo");
			return;
		}

		toast.success("Gruppo creato con successo");
		setShow(false);
		setShowOptions(false);
		setGroupName("");
		setUsers([]);
		updateChatList();
	};

	return (
		<>
			{/* Bottone per aprire il modal */}
			<span onClick={() => setShow(true)} style={{ cursor: "pointer" }}>
				{children}
			</span>

			<StandardModal
				title="Nuovo gruppo"
				titleIcon={
					<FaUserGroup
						className="text-primary d-flex justify-content-center ms-2"
						size={20}
					/>
				}
				saveBtnText="Crea"
				show={show}
				handleClose={() => {
					setShow(false);
				}}
				handleSubmit={handleSubmit}
			>
				<StandardInput
					type="text"
					name="groupName"
					title="Nome del gruppo"
					placeholder="Inserisci nome"
					onChange={handleChange}
					value={groupName}
				/>

				<StandardUsersInput
					originalUsenameList={[]}
					usernameList={users}
					setUsernameList={setUsers}
				/>
			</StandardModal>
		</>
	);
}
