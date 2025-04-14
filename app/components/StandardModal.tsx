import React from "react";
import { Button, Form, Modal } from "react-bootstrap";

interface StandardModalProps {
	children: React.ReactNode;
	title: string;
	titleIcon?: React.ReactNode;
	show: boolean;
	showCloseButton?: boolean;
	handleClose?: () => void;
	// Se saveBtnText o handleSubmit non sono definiti, non mostriamo il pulsante di salvataggio
	saveBtnText?: string;
	handleSubmit?: (event: React.FormEvent<HTMLFormElement>) => void;
	extraHeaderButtons?: React.ReactNode;
}

export function StandardModal({
	children,
	title,
	titleIcon,
	show,
	showCloseButton = true,
	handleClose,
	saveBtnText,
	handleSubmit,
	extraHeaderButtons
}: StandardModalProps) {
	// Se handleSubmit o saveBtnText non sono definiti, non mostriamo il pulsante di salvataggio
	function getSubmitButton() {
		if (handleSubmit && saveBtnText) {
			return (
				<Button type="submit" variant="primary" form="modalForm">
					{saveBtnText}
				</Button>
			);
		}
		return null;
	}

	// Se handleClose o showCloseButton non sono definiti, non mostriamo il pulsante di chiusura
	// La funzione di close é sempre definita e chiamata quando si preme la X
	function getCloseButton() {
		if (handleClose && showCloseButton) {
			return (
				<Button variant="secondary" onClick={handleClose}>
					Chiudi
				</Button>
			);
		}
		return null;
	}

	// Se non abbiamo pulsanti in fondo, non mostriamo il footer
	function getFooter() {
		if (getCloseButton() || getSubmitButton()) {
			return (
				<Modal.Footer>
					{getCloseButton()}
					{getSubmitButton()}
				</Modal.Footer>
			);
		}
		return null;
	}

	// Sulla destra del titolo, se abbiamo passato extraHeaderButtons, li mostriamo
	return (
		<Modal
			show={show}
			onHide={handleClose || undefined}
			size="lg"
			fullscreen="md-down"
			scrollable={true}
		>
			<Modal.Header closeButton>
				<div className="d-flex align-items-center w-100">
					<div className="d-flex align-items-center justify-content-center">
						{titleIcon && (
							<span className="modal-icon me-2">{titleIcon}</span>
						)}
						<Modal.Title>{title}</Modal.Title>
					</div>
					{extraHeaderButtons && (
						<div className="ms-auto d-flex align-items-center me-2">
							{extraHeaderButtons}
						</div>
					)}
				</div>
			</Modal.Header>

			<Modal.Body>
				<Form onSubmit={handleSubmit || undefined} id="modalForm">
					{children}
				</Form>
			</Modal.Body>
			{getFooter()}
		</Modal>
	);
}
