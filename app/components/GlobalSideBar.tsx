"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Button, Modal, Nav, Navbar, NavDropdown, Container, Offcanvas } from "react-bootstrap";
import {
	FaBars, FaCalendarAlt, FaCog, FaComments,
	FaInbox, FaProjectDiagram,
	FaStickyNote, FaStopwatch, FaUser
} from "react-icons/fa";
import "./GlobalSideBar.css";

// Riorganizzare i link principali
const mainLinks = [
	{ name: "Calendario", link: "/calendar" },
	{ name: "Progetti", link: "/projects" },
	{ name: "Note", link: "/notepad" },
	{ name: "Chat", link: "/chat" },
	{ name: "Pomodoro", link: "/pomodoro" },
];

// Link secondari raggruppati in "Altro"
const otherLinks = [
	{ name: "Impostazioni", icon: FaCog, link: "#impostazioni" },
	{ name: "Inbox", icon: FaInbox, link: "#inbox" },
];

// Struttura del menu principale
const menuItems = [
	{
		title: "Sistema",
		items: [
			{ name: "Inbox", icon: FaInbox, link: "#inbox" },
			{ name: "Impostazioni", icon: FaCog, link: "#impostazioni" },
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
];

export function GlobalSideBar() {
	const [showSidebar, setShowSidebar] = useState(false);
	const [showModal, setShowModal] = useState(false);

	const handleLogout = () => setShowModal(true);

	return (
		<>
			{/* Navbar per md+ */}
			<Navbar bg="light" expand="md" className="d-none d-md-flex border-bottom shadow-sm" fixed="top">
				<Container>
					<Navbar.Brand href="/home" className="fw-bold">
						<Image
							src="/Sloth.png"
							alt="Logo"
							height="50"
							width="110"
							className="d-inline-block align-text-top"
						/>
					</Navbar.Brand>
					<Nav className="mx-auto">
						{mainLinks.map((item, i) => (
							<Nav.Link
								key={i}
								href={item.link}
								className="px-4 py-3 nav-link-hover text-black"
							>
								{item.name}
							</Nav.Link>
						))}
					</Nav>
					<Nav>
						<NavDropdown
							title={<span className="text-black">Menu</span>}
							align="end"
							className="px-3"
						>
							{otherLinks.map((item, idx) => (
								<NavDropdown.Item href={item.link} key={idx}>
									{item.name}
								</NavDropdown.Item>
							))}
							<NavDropdown.Divider />
							<NavDropdown.Item onClick={handleLogout}>
								Logout
							</NavDropdown.Item>
						</NavDropdown>
					</Nav>
				</Container>
			</Navbar>

			{/* Pulsante sidebar per schermi < md */}
			<Button
				variant="primary"
				onClick={() => setShowSidebar(true)}
				className="toggle_btn d-md-none"
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

			{/* Offcanvas sidebar per schermi piccoli */}
			<Offcanvas
				show={showSidebar}
				onHide={() => setShowSidebar(false)}
				className="bg-light sidebar d-md-none"
				style={{
					width: '250px',
					boxShadow: '2px 0 5px rgba(0,0,0,0.1)'
				}}
			>
				<Offcanvas.Header closeButton>
					<a className="navbar-brand" href="./home">
						<Image
							src="/Sloth.png"
							alt="Logo"
							height="50"
							width="110"
							className="d-inline-block align-text-top"
						/>
					</a>
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
