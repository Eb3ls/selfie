"use client";

import React, { useState } from "react";
import { FaPlus } from "react-icons/fa";
import { toast } from "react-toastify";
import { StandardInput } from "../components/StandardInput";
import { StandardModal } from "../components/StandardModal";

export function AddProjectModal({ children, handleAdd }: any) {
	const [show, setShow] = useState(false);
	const [formData, setFormData] = useState({
		summary: ""
	});

	function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
		const { name, value } = event.target;
		setFormData({ ...formData, [name]: value });
	}

	function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();

		// Validazione minima degli input
		if (!formData.summary) {
			toast.error("Il titolo è obbligatorio");
			return;
		}

		// Passa i dati al componente padre
		handleAdd(formData);
	}

	return (
		<>
			{/* Bottone per aprire il modal */}
			<span onClick={() => setShow(true)} style={{ cursor: "pointer" }}>
				{children || <FaPlus />}
			</span>

			<StandardModal
				title="Crea Progetto"
				show={show}
				handleSubmit={handleSubmit}
				saveBtnText="Crea"
				handleClose={() => setShow(false)}
			>
				<StandardInput
					type="text"
					name="summary"
					title="Titolo del progetto"
					placeholder="Inserisci il titolo del progetto"
					value={formData.summary}
					onChange={handleChange}
				/>
			</StandardModal>
		</>
	);
}
