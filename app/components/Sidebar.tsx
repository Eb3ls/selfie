"use client";

import React, { useState } from "react";
import { Button, Modal, Nav, Offcanvas } from "react-bootstrap";
import {
	FaBars, FaCalendarAlt, FaCog, FaComments,
	FaHome, FaInbox, FaProjectDiagram,
	FaStickyNote, FaStopwatch, FaUser
} from "react-icons/fa";
import "./Sidebar.css";

// Struttura del menu principale
const menuItems = [
	{
		title: "Principale",
		items: [
			{ name: "Inbox", icon: FaInbox, link: "#inbox" },
			{ name: "Home", icon: FaHome, link: "/" },
		]
	},
	{
		title: "Strumenti",
		items: [
			{ name: "Calendario", icon: FaCalendarAlt, link: "/calendar" },
			{ name: "Progetti", icon: FaProjectDiagram, link: "/projects" },
			{ name: "Note", icon: FaStickyNote, link: "/notepad" },
			{ name: "Chat", icon: FaComments, link: "/chat" },
			{ name: "Pomodoro", icon: FaStopwatch, link: "/pomodoro" },
		]
	},
	{
		title: "Sistema",
		items: [
			{ name: "Impostazioni", icon: FaCog, link: "#impostazioni" },
		]
	}
];

export function Sidebar() {
	// Gestione stati per sidebar e modal
	const [showSidebar, setShowSidebar] = useState(false);
	const [showModal, setShowModal] = useState(false);

	// Funzione per aprire il modal di logout
	const handleLogout = () => setShowModal(true);

	return (
		<>
			{/* Pulsante per aprire la sidebar */}
			<Button
				variant="primary"
				onClick={() => setShowSidebar(true)}
				className="toggle_btn"
				style={{
					position: 'fixed',
					top: '1rem',
					left: '1rem',
					zIndex: 1030,
					padding: '0.5rem',
					display: showSidebar ? 'none' : 'block'
				}}
			>
				<FaBars />
			</Button>

			{/* Sidebar principale */}
			<Offcanvas
				show={showSidebar}
				onHide={() => setShowSidebar(false)}
				className="bg-light sidebar"
				style={{
					width: '250px',
					boxShadow: '2px 0 5px rgba(0,0,0,0.1)'
				}}
			>
				<Offcanvas.Header closeButton>
					<Offcanvas.Title className="fs-4 fw-bold">Menu</Offcanvas.Title>
				</Offcanvas.Header>

				<Offcanvas.Body className="d-flex flex-column">
					{/* Menu principale */}
					<div className="flex-grow-1">
						{menuItems.map((section, idx) => (
							<div key={idx} className="mb-4">
								<h6 className="text-muted px-3 mb-2">{section.title}</h6>
								<Nav className="flex-column">
									{section.items.map((item, i) => (
										<Nav.Link
											key={i}
											href={item.link}
											className="px-3 py-2 d-flex align-items-center"
											style={{
												transition: 'all 0.2s',
												borderRadius: '0.5rem',
												margin: '0.2rem 0.5rem',
											}}
										>
											<item.icon className="me-3" />
											{item.name}
										</Nav.Link>
									))}
								</Nav>
							</div>
						))}
					</div>

					{/* Pulsante logout in fondo */}
					<Button
						variant="outline-danger"
						onClick={handleLogout}
						className="mt-auto mx-3 mb-3 d-flex align-items-center justify-content-center gap-2"
					>
						<FaUser /> Logout
					</Button>
				</Offcanvas.Body>
			</Offcanvas>

			{/* Modal di conferma logout */}
			<Modal show={showModal} onHide={() => setShowModal(false)} centered>
				<Modal.Header closeButton>
					<Modal.Title>Logout</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<p>Sei sicuro di voler effettuare il logout?</p>
				</Modal.Body>
				<Modal.Footer>
					<Button variant="secondary" onClick={() => setShowModal(false)}>
						Annulla
					</Button>
					<Button variant="danger">Logout</Button>
				</Modal.Footer>
			</Modal>
		</>
	);
}
