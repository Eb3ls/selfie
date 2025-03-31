"use client";

import React, { useState } from "react";
import { Form } from "react-bootstrap";
import { FaFilter } from "react-icons/fa";
import StandardInput from "../components/StandardInput";
import StandardModal from "../components/StandardModal";
import "./GenericModal.css";

// TODO: Sistemare ricerca categorie - cercare più categorie insieme
export function FilterModal({ children, handleFilters }: any) {
	const [show, setShow] = useState(false);
	const [formData, setFormData] = useState({
		creationDateMin: "", // Usa null per evitare problemi di conversione
		creationDateMax: "",
		lengthMin: "", // Stringa vuota per i campi numerici che saranno convertiti
		lengthMax: "",
		categories: "" // Campo testo vuoto
	});

	function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
		const { name, value } = event.target;
		setFormData({ ...formData, [name]: value });
	}

	function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();

		// Conversione dei valori stringa vuoti solo se sono presenti valori
		const creationDateMin = formData.creationDateMin
			? new Date(formData.creationDateMin)
			: undefined;
		const creationDateMax = formData.creationDateMax
			? new Date(formData.creationDateMax)
			: undefined;
		const lengthMin = formData.lengthMin
			? parseInt(formData.lengthMin, 10)
			: undefined;
		const lengthMax = formData.lengthMax
			? parseInt(formData.lengthMax, 10)
			: undefined;

		// Controllo se la lunghezza minima è inferiore alla lunghezza massima
		if (
			lengthMin !== undefined &&
			lengthMax !== undefined &&
			lengthMin > lengthMax
		) {
			alert(
				"Lunghezza minima non può essere superiore alla lunghezza massima."
			);
			return;
		}

		// Controllo se la data minima è inferiore alla data massima
		if (
			creationDateMin &&
			creationDateMax &&
			creationDateMin > creationDateMax
		) {
			alert(
				"La data di creazione minima non può essere superiore alla data di creazione massima."
			);
			return;
		}

		// Filtro solo sui campi che hanno valori validi
		const filters = {
			...(creationDateMin && { creationDateMin }),
			...(creationDateMax && { creationDateMax }),
			...(lengthMin && { lengthMin }),
			...(lengthMax && { lengthMax }),
			...(formData.categories && { categories: formData.categories })
		};

		handleFilters(filters);

		// Reset del form dopo l'invio
		setFormData({
			creationDateMin: "",
			creationDateMax: "",
			lengthMin: "",
			lengthMax: "",
			categories: ""
		});
		setShow(false);
	}

	return (
		<>
			{/* Bottone per aprire il modal */}
			<span onClick={() => setShow(true)} style={{ cursor: "pointer" }}>
				{children}
			</span>

			<StandardModal
				title="Filtra Note"
				titleIcon={<FaFilter />}
				saveBtnText="Filtra"
				show={show}
				handleClose={() => setShow(false)}
				handleSubmit={handleSubmit}
			>
				<Form.Group className="mb-4" controlId="formCreationDate">
					<Form.Label>
						<strong>Data Creazione</strong>
					</Form.Label>
					<div className="row">
						<div className="col-12 col-sm-6 mb-3 mb-sm-0">
							<Form.Label>Minimo</Form.Label>
							<Form.Control
								type="date"
								name="creationDateMin"
								value={formData.creationDateMin} // Resta una stringa vuota se non è stato selezionato nulla
								onChange={handleChange}
								className="input-field"
							/>
						</div>
						<div className="col-12 col-sm-6">
							<Form.Label>Massimo</Form.Label>
							<Form.Control
								type="date"
								name="creationDateMax"
								value={formData.creationDateMax}
								onChange={handleChange}
								className="input-field"
							/>
						</div>
					</div>
				</Form.Group>

				<Form.Group className="mb-4" controlId="formLength">
					<Form.Label>
						<strong>Lunghezza</strong>
					</Form.Label>
					<div className="row">
						<div className="col-12 col-sm-6 mb-3 mb-sm-0">
							<Form.Label>Minimo</Form.Label>
							<Form.Control
								type="number"
								name="lengthMin"
								value={formData.lengthMin}
								onChange={handleChange}
								placeholder="Lunghezza minima"
								className="input-field"
							/>
						</div>
						<div className="col-12 col-sm-6">
							<Form.Label>Massimo</Form.Label>
							<Form.Control
								type="number"
								name="lengthMax"
								value={formData.lengthMax}
								onChange={handleChange}
								placeholder="Lunghezza massima"
								className="input-field"
							/>
						</div>
					</div>
				</Form.Group>

				<StandardInput
					type="text"
					name="categories"
					value={formData.categories}
					title="Categorie"
					placeholder="Inserisci categoria"
					onChange={handleChange}
					isRequired={false}
				/>
			</StandardModal>
		</>
	);
}
