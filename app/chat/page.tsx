"use client";

import React, { useEffect, useRef, useState } from "react";
import { Button, Col, Form, InputGroup, Row } from "react-bootstrap";
import { IoIosSend } from "react-icons/io";
import { chatBody, chatFooter } from "../color_palette";

const ChatMain = () => {
	const [messages, setMessages] = useState([
		{ id: 1, sender: "Alice", text: "Ciao!", date: "10:45" },
		{
			id: 2,
			sender: "Io",
			text: "Ciao Alice, come stai?",
			date: "10:46"
		},
		{
			id: 3,
			sender: "Alice",
			text: "Bene, grazie!",
			date: "10:47"
		},
		{
			id: 2,
			sender: "Io",
			text: "Ciao Alice, come stai?",
			date: "10:46"
		},
		{
			id: 2,
			sender: "Io",
			text: "Ciao Alice, come stai?",
			date: "10:46"
		},
		{
			id: 2,
			sender: "Io",
			text: "Ciao Alice, come stai?",
			date: "10:46"
		},
		{
			id: 2,
			sender: "Io",
			text: "Ciao Alice, come stai?",
			date: "10:46"
		},
		{
			id: 2,
			sender: "Io",
			text: "Ciao Alice, come stai?",
			date: "10:46"
		},
		{
			id: 2,
			sender: "Io",
			text: "Ciao Alice, come stai?",
			date: "10:46"
		},
		{
			id: 2,
			sender: "Io",
			text: "Ciao Alice, come stai?",
			date: "10:46"
		},
		{
			id: 2,
			sender: "Io",
			text: "Ciao Alice, come stai?",
			date: "10:46"
		},
		{
			id: 2,
			sender: "Io",
			text: "Ciao Alice, come stai?",
			date: "10:46"
		},
		{
			id: 2,
			sender: "Io",
			text: "Ciao Alice, come stai?",
			date: "10:46"
		},
		{
			id: 2,
			sender: "Io",
			text: "Ciao Alice, come stai?",
			date: "10:46"
		},
		{
			id: 2,
			sender: "Io",
			text: "Lorem Ipsum è un testo segnaposto utilizzato nel settore della tipografia e della stampa. Lorem Ipsum è considerato il testo segnaposto standard sin dal sedicesimo secolo, quando un anonimo tipografo prese una cassetta di caratteri e li assemblò per preparare un testo campione. È sopravvissuto non solo a più di cinque secoli, ma anche al passaggio alla videoimpaginazione, pervenendoci sostanzialmente inalterato. Fu reso popolare, negli anni ’60, con la diffusione dei fogli di caratteri trasferibili “Letraset”, che contenevano passaggi del Lorem Ipsum, e più recentemente da software di impaginazione come Aldus PageMaker, che includeva versioni del Lorem Ipsum.",
			date: "10:46"
		}
	]);
	const [newMessage, setNewMessage] = useState("");
	const chatEndRef = useRef<HTMLDivElement>(null);

	// Funzione per scrollare automaticamente alla fine della chat
	const scrollToBottom = () => {
		if (chatEndRef.current) {
			chatEndRef.current.scrollIntoView({ behavior: "smooth" });
		}
	};

	useEffect(() => {
		scrollToBottom();
	}, [messages]);

	function upperChat() {
		return (
			<div className="bg-dark text-white p-3 border-bottom border-black">
				<Row className="align-items-center">
					<Col>
						<h5>Chat con Alice</h5>
					</Col>
					<Col xs="auto">
						<Form.Control type="text" placeholder="Cerca..." />
					</Col>
					<Col xs="auto">
						<Button variant="outline-primary">Opzioni</Button>
					</Col>
				</Row>
			</div>
		);
	}

	function footerChat() {
		return (
			<div
				className="p-3 rounded-pill px-5 w-50 mx-auto"
				style={{ backgroundColor: chatFooter }}
			>
				<InputGroup>
					<Form.Control
						type="text"
						placeholder="Scrivi un messaggio..."
						value={newMessage}
						className={"bg-transparent border-0 text-white"}
						onChange={(e) => setNewMessage(e.target.value)}
					/>
					<Button>
						<IoIosSend fontVariant="primary" />
					</Button>
				</InputGroup>
			</div>
		);
	}

	return (
		<div
			className="d-flex flex-column vh-100"
			style={{ backgroundColor: chatBody }}
		>
			{upperChat()}
			{/* Blocco centrale con la chat */}
			<div className="flex-grow-1 overflow-auto p-3">
				{messages.map((message) => (
					<div
						key={message.id}
						className={`d-flex ${message.sender === "Io" ? "justify-content-end" : "justify-content-start"} mb-2`}
					>
						<div
							className={`p-2 px-4 rounded ${message.sender === "Io" ? "bg-primary text-white" : "bg-light text-dark"}`}
							style={{ maxWidth: "70%" }}
						>
							<div>{message.text}</div>
							<div className="text-end">{message.date}</div>
						</div>
					</div>
				))}
				{/* Questo div serve per scrollare automaticamente al fondo */}
				<div ref={chatEndRef}></div>
				{footerChat()}
			</div>
		</div>
	);
};

export default ChatMain;
