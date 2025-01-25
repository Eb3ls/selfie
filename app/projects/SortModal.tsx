"use client";

import React, { useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { FaSortAlphaDown, FaSortAlphaUp } from "react-icons/fa";
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
					<Modal.Title>Ordina Progetti</Modal.Title>
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
										handleSortClick("summary", "asc")
									}
									className="custom-sort-button"
								>
									<FaSortAlphaUp /> Crescente
								</Button>
								<Button
									variant="light"
									onClick={() =>
										handleSortClick("summary", "desc")
									}
									className="custom-sort-button"
								>
									<FaSortAlphaDown /> Decrescente
								</Button>
							</div>
						</Form.Group>

						<Form.Group
							className="mb-4"
							controlId="formSortAlphabetical"
						>
							<Form.Label>
								<strong>Owner</strong>
							</Form.Label>
							<div className="d-flex justify-content-between">
								<Button
									variant="light"
									onClick={() =>
										handleSortClick("owner", "asc")
									}
									className="custom-sort-button"
								>
									<FaSortAlphaUp /> Crescente
								</Button>
								<Button
									variant="light"
									onClick={() =>
										handleSortClick("owner", "desc")
									}
									className="custom-sort-button"
								>
									<FaSortAlphaDown /> Decrescente
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
