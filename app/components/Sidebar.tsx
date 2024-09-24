"use client";

import React, { useState } from "react";
import { Button, Modal, Nav, Offcanvas } from "react-bootstrap";
import {
	FaBars,
	FaCalendarAlt,
	FaCog,
	FaComments,
	FaHome,
	FaInbox,
	FaProjectDiagram,
	FaStickyNote,
	FaStopwatch
} from "react-icons/fa";
import styles from "./Sidebar.module.css";

const Sidebar = () => {
	const [showSidebar, setShowSidebar] = useState(false);
	const [showModal, setShowModal] = useState(false);

	const toggleSidebar = () => setShowSidebar(!showSidebar);
	const toggleModal = () => setShowModal(!showModal);

	return (
		<>
			{/* Trigger button for Sidebar using hamburger icon */}
			{!showSidebar && (
				<Button
					variant="primary"
					onClick={toggleSidebar}
					className={styles.toggle_btn}
				>
					<FaBars />
				</Button>
			)}

			{/* Offcanvas component for Sidebar */}
			<Offcanvas
				show={showSidebar}
				onHide={toggleSidebar}
				backdrop={true}
				className="bg-light"
				placement="start"
			>
				<Offcanvas.Header closeButton>
					<Offcanvas.Title>Menu</Offcanvas.Title>
				</Offcanvas.Header>
				<Offcanvas.Body>
					<Nav className="flex-column">
						{/* Utente */}
						<Nav.Item>
							<Nav.Link onClick={toggleModal}>Utente</Nav.Link>
						</Nav.Item>
						{/* Inbox */}
						<Nav.Item>
							<Nav.Link href="#inbox">
								<FaInbox /> Inbox
							</Nav.Link>
						</Nav.Item>
						{/* Home */}
						<Nav.Item>
							<Nav.Link href="#home">
								<FaHome /> Home
							</Nav.Link>
						</Nav.Item>
						{/* Separator */}
						<hr />
						{/* Calendario */}
						<Nav.Item>
							<Nav.Link href="#calendario">
								<FaCalendarAlt /> Calendario
							</Nav.Link>
						</Nav.Item>
						{/* Progetti */}
						<Nav.Item>
							<Nav.Link href="#progetti">
								<FaProjectDiagram /> Progetti
							</Nav.Link>
						</Nav.Item>
						{/* Note */}
						<Nav.Item>
							<Nav.Link href="#note">
								<FaStickyNote /> Note
							</Nav.Link>
						</Nav.Item>
						{/* Chat */}
						<Nav.Item>
							<Nav.Link href="#chat">
								<FaComments /> Chat
							</Nav.Link>
						</Nav.Item>
						{/* Pomodoro */}
						<Nav.Item>
							<Nav.Link href="#pomodoro">
								<FaStopwatch /> Pomodoro
							</Nav.Link>
						</Nav.Item>
						{/* Separator */}
						<hr />
						{/* Impostazioni */}
						<Nav.Item>
							<Nav.Link href="#impostazioni">
								<FaCog /> Impostazioni
							</Nav.Link>
						</Nav.Item>
					</Nav>
				</Offcanvas.Body>
			</Offcanvas>

			{/* Modal for Utente logout */}
			<Modal show={showModal} onHide={toggleModal} centered>
				<Modal.Header closeButton>
					<Modal.Title>Logout</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<p>Sei sicuro di voler effettuare il logout?</p>
				</Modal.Body>
				<Modal.Footer>
					<Button variant="secondary" onClick={toggleModal}>
						Annulla
					</Button>
					<Button variant="danger">Logout</Button>
				</Modal.Footer>
			</Modal>
		</>
	);
};

export default Sidebar;
