"use client";

import React, { useState } from "react";
import { Button, Form } from "react-bootstrap";
import { FaSortAlphaDown, FaSortAlphaUp } from "react-icons/fa";
import { StandardModal } from "../components/StandardModal";

export function SortModal({ children, handleSort }: any) {
	const [show, setShow] = useState(false);

	function handleSortClick(field: string, direction: "asc" | "desc") {
		// Invio dell'ordinamento selezionato
		handleSort({ field, direction });
		setShow(false);
	}

	function handleReset() {
		handleSort(null);
		setShow(false);
	}

	function resetButton() {
		return (
			<Button
				variant="light"
				onClick={handleReset}
				className="px-4 py-2 border-0 rounded-3 hover-lift"
			>
				Resetta
			</Button>
		);
	}

	return (
		<>
			{/* Bottone per aprire il modal */}
			<span onClick={() => setShow(true)} style={{ cursor: "pointer" }}>
				{children}
			</span>

			<StandardModal
				title="Ordina Progetti"
				titleIcon={<FaSortAlphaDown />}
				show={show}
				handleClose={() => setShow(false)}
				extraHeaderButtons={resetButton()}
			>
				<Form.Group className="mb-4" controlId="formSortAlphabetical">
					<Form.Label>
						<strong>Titolo</strong>
					</Form.Label>
					<div className="d-flex justify-content-between">
						<Button
							variant="light"
							onClick={() => handleSortClick("summary", "asc")}
						>
							<FaSortAlphaUp /> Crescente
						</Button>
						<Button
							variant="light"
							onClick={() => handleSortClick("summary", "desc")}
						>
							<FaSortAlphaDown /> Decrescente
						</Button>
					</div>
				</Form.Group>

				<Form.Group className="mb-4" controlId="formSortOwner">
					<Form.Label>
						<strong>Proprietario</strong>
					</Form.Label>
					<div className="d-flex justify-content-between">
						<Button
							variant="light"
							onClick={() => handleSortClick("owner", "asc")}
						>
							<FaSortAlphaUp /> Crescente
						</Button>
						<Button
							variant="light"
							onClick={() => handleSortClick("owner", "desc")}
						>
							<FaSortAlphaDown /> Decrescente
						</Button>
					</div>
				</Form.Group>
			</StandardModal>
		</>
	);
}
