"use client";

import { StandardInput } from "@/app/components/StandardInput";
import { StandardModal } from "@/app/components/StandardModal";
import { StandardUsersInput } from "@/app/components/StandardUsersInput";
import React, { useState } from "react";
import { FaEdit } from "react-icons/fa";

export function EditNoteModal({
	note,
	currentUserId,
	handleEdit,
	children
}: any) {
	const [show, setShow] = useState(false);
	const [formData, setFormData] = useState({
		summary: note.summary,
		categories: note.categories,
		access: note.access
	});
	const [usernameList, setUsernameList] = useState<string[]>(
		note.userNameList || []
	);

	function handleChange(
		event: React.ChangeEvent<
			HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
		>
	) {
		const { name, value } = event.target;
		setFormData({ ...formData, [name]: value });
	}

	function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();

		// Validazione minima degli input
		if (!formData.summary) {
			alert("Il titolo è obbligatorio");
			return;
		}

		// Aggiorna la nota con i nuovi dati
		handleEdit({
			_id: note._id,
			summary: formData.summary,
			categories: formData.categories,
			access: formData.access,
			usernameList: usernameList
		});

		// Chiude il modal
		setShow(false);
	}

	return (
		<>
			{/* Bottone per aprire il modal */}
			<span onClick={() => setShow(true)} style={{ cursor: "pointer" }}>
				{children || <FaEdit />}{" "}
				{/* Usa il children passato o l'icona di default */}
			</span>

			<StandardModal
				title="Modifica Nota"
				saveBtnText="Salva"
				show={show}
				handleClose={() => setShow(false)}
				handleSubmit={handleSubmit}
			>
				<StandardInput
					type="text"
					name="summary"
					value={formData.summary}
					title="Titolo"
					placeholder="Inserisci il titolo della nota"
					onChange={handleChange}
				/>

				<StandardInput
					type="text"
					name="categories"
					value={formData.categories}
					title="Categorie"
					placeholder="Modifica le categorie separate da virgola"
					onChange={handleChange}
					isRequired={false}
				/>

				<StandardInput
					type="select"
					title="Permessi"
					name="access"
					value={formData.access}
					optionMap={{
						PRIVATE: "Privata",
						INVITED: "A invito",
						PUBLIC: "Pubblica"
					}}
					onChange={handleChange}
				/>

				{formData.access === "INVITED" && (
					<StandardUsersInput
						mainId={"42"}
						usernameList={usernameList}
						setUsernameList={setUsernameList}
					/>
				)}
			</StandardModal>
		</>
	);
}
