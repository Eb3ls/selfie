import React from "react";
import { Button, Form, Modal } from "react-bootstrap";

interface StandardModalProps {
	children: React.ReactNode;
	title: string;
	titleIcon?: React.ReactNode;
	show: boolean;
	showCloseButton?: boolean;
	handleClose?: () => void;
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
	function getSubmitButton() {
		if (handleSubmit && saveBtnText) {
			return (
				<Button
					type="submit"
					variant="primary"
					form="modalForm"
					className="px-4 py-2 border-0 rounded-3 hover-lift"
				>
					{saveBtnText}
				</Button>
			);
		}
		return null;
	}

	function getCloseButton() {
		if (handleClose && showCloseButton) {
			return (
				<Button
					variant="light"
					onClick={handleClose}
					className="px-4 py-2 border-0 rounded-3 hover-lift"
				>
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
				<Modal.Footer className="border-0 px-4 pb-4">
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
			style={
				{
					"--bs-modal-border-radius": "1rem"
				} as React.CSSProperties
			}
		>
			<Modal.Header className="border-0 px-4 pt-4">
				<div className="d-flex align-items-center w-100">
					<div className="d-flex align-items-center">
						{titleIcon && (
							<span className="me-3 opacity-75">{titleIcon}</span>
						)}
						<Modal.Title className="fw-bold">{title}</Modal.Title>
					</div>
					{extraHeaderButtons && (
						<div className="ms-auto">{extraHeaderButtons}</div>
					)}
				</div>
			</Modal.Header>

			<Modal.Body className="px-4">
				<Form onSubmit={handleSubmit || undefined} id="modalForm">
					{children}
				</Form>
			</Modal.Body>
			{getFooter()}
		</Modal>
	);
}
