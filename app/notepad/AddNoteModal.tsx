"use client";

import React, { useState } from "react";
import { FaPlus } from "react-icons/fa";
import { StandardInput } from "../components/StandardInput";
import { StandardModal } from "../components/StandardModal";

export function AddNoteModal({ children, handleAdd }: any) {
	const [show, setShow] = useState(false);
	const [formData, setFormData] = useState({
		summary: "",
		categories: ""
	});

	function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
		const { name, value } = event.target;
		setFormData({ ...formData, [name]: value });
	}

	function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();

		// Validazione minima degli input
		if (!formData.summary) {
			alert("Il titolo della nota è obbligatorio!");
			return;
		}

		// Passa i dati al componente padre
		handleAdd(formData);

		// Resetta i dati del form dopo l'invio
		setFormData({
			summary: "",
			categories: ""
		});

		// Chiude il modal
		setShow(false);
	}

	return (
		<>
			{/* Bottone per aprire il modal */}
			<span onClick={() => setShow(true)} style={{ cursor: "pointer" }}>
				{children || <FaPlus />}
			</span>
			<StandardModal
				title="Aggiungi Nota"
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
					onChange={handleChange}
					placeholder="Inserisci le categorie separate da virgola"
					isRequired={false}
				/>
			</StandardModal>
		</>
	);
}
