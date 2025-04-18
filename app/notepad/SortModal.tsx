"use client";

import React, { useState } from "react";
import { Button, Form } from "react-bootstrap";
import {
	FaSortAlphaDown,
	FaSortAlphaUp,
	FaSortAmountDown,
	FaSortAmountUp,
	FaSortNumericDown,
	FaSortNumericUp
} from "react-icons/fa";
import { StandardModal } from "../components/StandardModal";

interface SortModalProps {
	children: React.ReactNode;
	setSortParams: (sort: any) => void;
}

export function SortModal({ children, setSortParams }: SortModalProps) {
	const [show, setShow] = useState(false);

	function handleSortClick(field: string, direction: "asc" | "desc") {
		// Invio dell'ordinamento selezionato
		setSortParams({ field, direction });
		setShow(false);
	}

	function handleReset() {
		setSortParams(null);
		setShow(false);
	}

	function resetButton() {
		return (
			<Button
				variant="light"
				onClick={handleReset}
				className="px-4 py-2 border-0 rounded-3 hover-lift"
			>
				Ripristina
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
				title="Ordina Note"
				saveBtnText="Applica"
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
							onClick={() =>
								handleSortClick("alphabetical", "asc")
							}
						>
							<FaSortAlphaUp /> Crescente
						</Button>
						<Button
							variant="light"
							onClick={() =>
								handleSortClick("alphabetical", "desc")
							}
						>
							<FaSortAlphaDown /> Decrescente
						</Button>
					</div>
				</Form.Group>

				<Form.Group className="mb-4" controlId="formSortDate">
					<Form.Label>
						<strong>Data di creazione</strong>
					</Form.Label>
					<div className="d-flex justify-content-between">
						<Button
							variant="light"
							onClick={() => handleSortClick("date", "asc")}
						>
							<FaSortNumericUp /> Crescente
						</Button>
						<Button
							variant="light"
							onClick={() => handleSortClick("date", "desc")}
						>
							<FaSortNumericDown /> Decrescente
						</Button>
					</div>
				</Form.Group>

				<Form.Group className="mb-4" controlId="formSortLength">
					<Form.Label>
						<strong>Lunghezza</strong>
					</Form.Label>
					<div className="d-flex justify-content-between">
						<Button
							variant="light"
							onClick={() => handleSortClick("length", "asc")}
						>
							<FaSortAmountUp /> Crescente
						</Button>
						<Button
							variant="light"
							onClick={() => handleSortClick("length", "desc")}
						>
							<FaSortAmountDown /> Decrescente
						</Button>
					</div>
				</Form.Group>
			</StandardModal>
		</>
	);
}
