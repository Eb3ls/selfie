import React from "react";
import { Button, Form, Modal } from "react-bootstrap";

interface StandardModalProps {
	children: React.ReactNode;
	title: string;
	titleIcon?: React.ReactNode;
	saveBtnText: string;
	show: boolean;
	handleClose: () => void;
	handleSubmit?: (event: React.FormEvent<HTMLFormElement>) => void;
}

export default function StandardModal({
	children,
	title,
	titleIcon,
	saveBtnText,
	show,
	handleClose,
	handleSubmit
}: StandardModalProps) {
	return (
		<Modal show={show} onHide={handleClose} size="lg" scrollable={true}>
			<Modal.Header closeButton>
				{titleIcon && <span className="modal-icon">{titleIcon}</span>}
				<Modal.Title>{title}</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<Form onSubmit={handleSubmit} id="modalForm">
					{children}
				</Form>
			</Modal.Body>
			<Modal.Footer>
				<Button variant="secondary" onClick={handleClose}>
					Chiudi
				</Button>
				{handleSubmit && (
					<Button type="submit" variant="primary" form="modalForm">
						{saveBtnText}
					</Button>
				)}
			</Modal.Footer>
		</Modal>
	);
}
