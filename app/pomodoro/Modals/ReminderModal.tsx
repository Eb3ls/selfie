import React, { useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { FaLightbulb } from "react-icons/fa6";

interface ReminderModalInterface {
	studyTime: number;
	sessions: number;
	breakTime: number;
	children: any;
}

export function ReminderModal({
	studyTime,
	sessions,
	breakTime,
	children
}: ReminderModalInterface) {
	const [show, setShow] = useState(false);

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
				fullscreen="lg-down"
			>
				<Modal.Header closeButton className="custom-modal-header">
					<Modal.Title>
						<FaLightbulb size={30} className="mx-2" />
						Impostazioni Pomodoro
					</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<div className="d-flex justify-content-between align-column">
						<div className="d-flex flex-column  align-items-center">
							<p>studyTime</p>
							<p>{studyTime}</p>
						</div>
						<div className="d-flex flex-column  align-items-center">
							<p>sessions</p>
							<p>{sessions}</p>
						</div>
						<div className="d-flex flex-column  align-items-center">
							<p>breakTime</p>
							<p>{breakTime}</p>
						</div>
					</div>
				</Modal.Body>
				<Modal.Footer>
					<Button
						variant="primary"
						onClick={() => setShow(false)}
						className="custom-submit-button"
					>
						Chiudi
					</Button>
				</Modal.Footer>
			</Modal>
		</>
	);
}

export default ReminderModal;
