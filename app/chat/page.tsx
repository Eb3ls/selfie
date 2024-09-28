"use client";

import React, { useEffect, useRef, useState } from "react";
import { Col, Container, ListGroup, Row } from "react-bootstrap";
import { chatBody } from "../color_palette";
import "./chat.css";
import Footer from "./mainChat/Footer";
import Header from "./mainChat/Header";
import MessageComponent from "./mainChat/Messagge";
import FloatingMenu from "./sideBar/FloatingMenu";
import SideBarHeader from "./sideBar/SideBarHeader";
import UserItem from "./sideBar/UserItem";

type Message = {
	id: number;
	sender: string;
	text: string;
	date: string;
};

type ChatData = {
	[key: string]: Message[];
};

const data: ChatData = {
	Alice: [
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
			id: 4,
			sender: "Io",
			text: "Lorem Ipsum è un testo segnaposto utilizzato nel settore della tipografia e della stampa. Lorem Ipsum è considerato il testo segnaposto standard sin dal sedicesimo secolo, quando un anonimo tipografo prese una cassetta di caratteri e li assemblò per preparare un testo campione. È sopravvissuto non solo a più di cinque secoli, ma anche al passaggio alla videoimpaginazione, pervenendoci sostanzialmente inalterato. Fu reso popolare, negli anni ’60, con la diffusione dei fogli di caratteri trasferibili “Letraset”, che contenevano passaggi del Lorem Ipsum, e più recentemente da software di impaginazione come Aldus PageMaker, che includeva versioni del Lorem Ipsum.",
			date: "10:46"
		}
	],
	Tomba: [
		{ id: 1, sender: "Tomba", text: "Ciao!", date: "10:45" },
		{
			id: 2,
			sender: "Io",
			text: "Ciao Tomba, come stai?",
			date: "10:46"
		},
		{
			id: 3,
			sender: "Tomba",
			text: "Bene, grazie!",
			date: "10:47"
		}
	],
	Mario: [],
	Franco: [],
	Daniele: [],
	Mirco: [],
	Andrea: [],
	Marco: [],
	Giuseppe: [],
	Antonio: [],
	Luca: [],
	Giovanni: [],
	Roberto: [],
	Giorgio: [],
	Stefano: [],
	Michele: [],
	Angelo: []
};

const ChatMain = () => {
	const [selectedUser, setSelectedUser] = useState<string | null>(null);
	const [messages, setMessages] = useState<Message[]>([]);
	const [newMessage, setNewMessage] = useState("");
	const [isSidebarOpen, setIsSidebarOpen] = useState(true);
	const chatEndRef = useRef<HTMLDivElement>(null);

	// Funzione per scrollare automaticamente alla fine della chat
	const scrollToBottom = () => {
		if (chatEndRef.current) {
			chatEndRef.current.scrollIntoView({ behavior: "smooth" });
		}
	};

	// Scrolla automaticamente alla fine della chat quando si aggiunge un nuovo messaggio
	useEffect(() => {
		scrollToBottom();
	}, [messages]);

	// Funzione per inviare un messaggio
	const sendMessage = () => {
		if (newMessage.trim() === "" || selectedUser === null) return;
		setNewMessage("");
		data[selectedUser].push({
			id: data[selectedUser].length + 1,
			sender: "Io",
			text: newMessage,
			date: new Date().toLocaleTimeString()
		});
	};

	// Funzione per caricare la chat con un utente
	function loadChat(user: string) {
		setSelectedUser(user);
		setMessages(data[user]);
		setIsSidebarOpen(false);
	}

	// Componente per la sidebar
	function Sidebar() {
		const [searchTerm, setSearchTerm] = useState("");
		const users = Object.keys(data);
		const filteredUsers = users.filter((user) =>
			user.toLowerCase().includes(searchTerm.toLowerCase())
		);

		return (
			<>
				<SideBarHeader
					searchTerm={searchTerm}
					setSearchTerm={setSearchTerm}
				></SideBarHeader>
				<div
					className="me-4 me-lg-0 flex-grow-1 overflow-auto"
					style={{ maxHeight: "90vh" }}
				>
					<ListGroup variant="flush" className="ms-1">
						{filteredUsers.length > 0 ? (
							filteredUsers.map((user) => (
								<UserItem
									key={user}
									user={user}
									loadChat={loadChat}
									data={data}
								></UserItem>
							))
						) : (
							<ListGroup.Item className="fw-bold p-2 ps-4 rounded-pill border-0 d-flex align-items-center bg-transparent text-white">
								Nessun utente trovato
							</ListGroup.Item>
						)}
					</ListGroup>
				</div>
				<FloatingMenu></FloatingMenu>
			</>
		);
	}

	function MainChatComponent() {
		return (
			<>
				<Header
					setIsSidebarOpen={setIsSidebarOpen}
					setSelectedUser={setSelectedUser}
					selectedUser={selectedUser}
				></Header>
				<div className="flex-grow-1 overflow-auto p-3">
					{messages.map((message) => (
						<MessageComponent key={message.id} msg={message} />
					))}
					<div ref={chatEndRef}></div>
				</div>
				<Footer
					setNewMessage={setNewMessage}
					newMessage={newMessage}
					sendMessage={sendMessage}
				></Footer>
			</>
		);
	}

	return (
		<Container fluid className="vh-100">
			<Row className="h-100">
				<Col
					xs={12}
					lg={3}
					className={`d-flex flex-column p-0 px-2 h-100 position-relative bg-dark border-end border-black ${isSidebarOpen ? "d-block" : "d-none d-lg-block"}`}
				>
					{Sidebar()}
				</Col>
				<Col
					xs={12}
					lg={9}
					style={{ backgroundColor: chatBody }}
					className={`d-flex flex-column p-0 h-100 ${isSidebarOpen ? "d-none d-lg-block" : "d-block"}`}
				>
					{selectedUser && MainChatComponent()}
				</Col>
			</Row>
		</Container>
	);
};

export default ChatMain;

//TODO quando si restring troppo l'header fa overflow-x
