"use client";

import React, { useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import {
	FaSortAlphaDown,
	FaSortAlphaUp,
	FaSortAmountDown,
	FaSortAmountUp,
	FaSortNumericDown,
	FaSortNumericUp
} from "react-icons/fa";
import "./GenericModal.css";

export function SortModal({ children, handleSort }: any) {
	const [show, setShow] = useState(false);

	function handleSortClick(field: string, direction: "asc" | "desc") {
		// Invio dell'ordinamento selezionato
		handleSort({ field, direction });
		setShow(false);
	}

	return (
		<>
			{/* Bottone per aprire il modal */}
			<span onClick={() => setShow(true)} style={{ cursor: "pointer" }}>
				{children}
			</span>

			<Modal
				show={show}
				onHide={() => setShow(false)}
				centered
				dialogClassName="custom-modal"
				backdropClassName="custom-backdrop"
			>
				<Modal.Header closeButton className="custom-modal-header">
					<Modal.Title>Ordina Note</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<Form className="custom-form">
						<Form.Group
							className="mb-4"
							controlId="formSortAlphabetical"
						>
							<Form.Label>
								<strong>Titolo</strong>
							</Form.Label>
							<div className="d-flex justify-content-between">
								<Button
									variant="light"
									onClick={() =>
										handleSortClick("alphabetical", "asc")
									}
									className="custom-sort-button"
								>
									<FaSortAlphaUp /> Crescente
								</Button>
								<Button
									variant="light"
									onClick={() =>
										handleSortClick("alphabetical", "desc")
									}
									className="custom-sort-button"
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
									onClick={() =>
										handleSortClick("date", "asc")
									}
									className="custom-sort-button"
								>
									<FaSortNumericUp /> Crescente
								</Button>
								<Button
									variant="light"
									onClick={() =>
										handleSortClick("date", "desc")
									}
									className="custom-sort-button"
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
									onClick={() =>
										handleSortClick("length", "asc")
									}
									className="custom-sort-button"
								>
									<FaSortAmountUp /> Crescente
								</Button>
								<Button
									variant="light"
									onClick={() =>
										handleSortClick("length", "desc")
									}
									className="custom-sort-button"
								>
									<FaSortAmountDown /> Decrescente
								</Button>
							</div>
						</Form.Group>
					</Form>
				</Modal.Body>
				<Modal.Footer>
					<Button
						variant="secondary"
						onClick={() => setShow(false)}
						className="custom-cancel-button"
					>
						Annulla
					</Button>
				</Modal.Footer>
			</Modal>
		</>
	);
}
