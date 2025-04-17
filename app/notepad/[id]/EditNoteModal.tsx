"use client";

import { StandardInput } from "@/app/components/StandardInput";
import { StandardModal } from "@/app/components/StandardModal";
import { StandardUsersInput } from "@/app/components/StandardUsersInput";
import { safeFetch } from "@/utils/fetch/fetch";
import React, { useState } from "react";
import { FaEdit } from "react-icons/fa";
import { toast } from "react-toastify";

interface EditNoteModalProps {
	note: any;
	mutate: () => void;
	children?: React.ReactNode;
}

export function EditNoteModal({ note, mutate, children }: EditNoteModalProps) {
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

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();

		// Validazione minima degli input
		if (!formData.summary) {
			toast.error("Il titolo della nota è obbligatorio");
			return;
		}

		// Prendiamo la lista delle categorie separate da virgola non vuote
		const categories = formData.categories
			.split(",")
			.map((category: string) => category.trim())
			.filter((category: string) => category !== "");
		formData.categories = categories.join(",");

		// Aggiorna la nota con i nuovi dati
		const body = {
			_id: note._id,
			summary: formData.summary,
			categories: formData.categories,
			access: formData.access,
			usernameList: usernameList
		};

		const response = await safeFetch(
			fetch("/api/notepad/modifyPermission", {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify(body)
			})
		);

		if (response.ok) {
			toast.success("Permessi aggiornati con successo!");
			mutate();
		} else {
			toast.error("Errore durante l'aggiornamento dei permessi");
		}

		// Troviamo gli utenti che appartengono sia alla lista originale che a quella nuova
		const commonElements = note.userNameList.filter((element: string) =>
			usernameList.includes(element)
		);

		// Svuotiamo il modal
		setUsernameList(commonElements);

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
						originalUsenameList={note.userNameList}
						usernameList={usernameList}
						setUsernameList={setUsernameList}
					/>
				)}
			</StandardModal>
		</>
	);
}
