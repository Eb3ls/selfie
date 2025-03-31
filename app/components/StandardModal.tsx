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
		<Modal show={show} onHide={handleClose}>
			<Modal.Header closeButton>
				{titleIcon && <span className="modal-icon">{titleIcon}</span>}
				<Modal.Title>{title}</Modal.Title>
			</Modal.Header>
			<Form onSubmit={handleSubmit} className="custom-form">
				<Modal.Body>{children}</Modal.Body>
				<Modal.Footer>
					<Button variant="secondary" onClick={handleClose}>
						Chiudi
					</Button>
					{handleSubmit && (
						<Button type="submit" variant="primary">
							{saveBtnText}
						</Button>
					)}
				</Modal.Footer>
			</Form>
		</Modal>
	);
}
