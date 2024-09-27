"use client";

import React, { useEffect, useRef, useState } from "react";
import {
	Button,
	Col,
	Container,
	Form,
	InputGroup,
	ListGroup,
	Row
} from "react-bootstrap";
import { FaArrowLeft, FaSearch } from "react-icons/fa";
import { IoIosAddCircleOutline, IoIosSend } from "react-icons/io";
import { IoPersonCircleOutline } from "react-icons/io5";
import { chatBody, chatFooter } from "../color_palette";
import styles from "./chat.module.css";

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
	]
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

	// Componente per visualizzare un utente nella sidebar
	function UserItemComponent({ user }: any) {
		return (
			<ListGroup.Item
				key={user}
				action
				className={`fw-bold p-2 ps-4 rounded-pill border-0 d-flex align-items-center bg-transparent text-white ${styles.userHover}`}
				onClick={() => loadChat(user)}
			>
				<IoPersonCircleOutline
					size={35}
					className="me-2 flex-shrink-0"
					style={{ minWidth: "35px" }}
				/>
				<Container className="d-flex flex-column justify-content-center overflow-hidden">
					<h5 className="fw-bold m-0 text-truncate">{user}</h5>{" "}
					<p
						className="m-0 fw-semibold text-truncate"
						style={{ fontSize: "0.8rem" }}
					>
						{data[user][data[user].length - 1].sender + ": "}
						<span className="fw-normal text-truncate">
							{data[user][data[user].length - 1].text}
						</span>
					</p>
				</Container>
			</ListGroup.Item>
		);
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
				<div
					className="d-flex justify-content-between p-1 mt-2"
					style={{
						position: "sticky",
						top: 0
					}}
				>
					<InputGroup>
						<Form.Control
							type="text"
							placeholder="Cerca utenti..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
						/>
						<InputGroup.Text>
							<FaSearch />
						</InputGroup.Text>
					</InputGroup>
				</div>
				<div
					style={{ flexGrow: 1, overflowY: "auto" }}
					className="me-sm-4"
				>
					<ListGroup variant="flush" className="mx-2 mt-3">
						{filteredUsers.length > 0 ? (
							filteredUsers.map((user) =>
								UserItemComponent({ user })
							)
						) : (
							<ListGroup.Item className="fw-bold p-2 ps-4 rounded-pill border-0 d-flex align-items-center bg-transparent text-white">
								Nessun utente trovato
							</ListGroup.Item>
						)}
					</ListGroup>
				</div>
			</>
		);
	}

	// Componenti per la chat
	function MessageComponent({ msg }: any) {
		return (
			<div
				className={`d-flex ${msg.sender === "Io" ? "justify-content-end" : "justify-content-start"} mb-2`}
			>
				<div
					className={`p-2 px-4 rounded-top text-break ${msg.sender === "Io" ? "bg-primary text-white rounded-start" : "bg-light text-dark rounded-end"}`}
					style={{ maxWidth: "65%" }}
				>
					<div>{msg.text}</div>
					<div className="text-end">{msg.date}</div>
				</div>
			</div>
		);
	}

	function HeaderComponent() {
		return (
			<div className="bg-dark text-white p-3 border-bottom border-black d-flex align-items-center justify-content-end">
				<Button
					variant="link"
					className="d-block d-ld-none"
					onClick={() => {
						setIsSidebarOpen(true);
						setSelectedUser(null);
					}}
				>
					<FaArrowLeft fill="white" size={30}></FaArrowLeft>
				</Button>
				<h2 className="text-center m-0 fw-bold flex-grow-1">
					{selectedUser}
				</h2>
				<Form.Control
					type="text"
					placeholder="Cerca..."
					className="me-3 w-auto"
				/>
				<Button variant="outline-primary">Opzioni</Button>
			</div>
		);
	}

	function FooterComponent() {
		return (
			<div
				className="p-3 mb-3 rounded-pill w-50 mx-auto"
				style={{ backgroundColor: chatFooter }}
			>
				<InputGroup>
					<Form.Control
						type="text"
						placeholder="Scrivi un messaggio..."
						value={newMessage}
						className={`bg-transparent border-0 text-white ${styles.chatInput}`}
						onChange={(e) => setNewMessage(e.target.value)}
					/>
					<Button
						className="bg-transparent border-0"
						onClick={sendMessage}
					>
						<IoIosSend
							fill="white"
							size={30}
							className={`${styles.iconHover}`}
						/>
					</Button>
				</InputGroup>
			</div>
		);
	}

	function MainChatComponent() {
		return (
			<>
				{HeaderComponent()}
				<div className="flex-grow-1 overflow-auto p-3">
					{messages.map((message) => (
						<MessageComponent key={message.id} msg={message} />
					))}
					<div ref={chatEndRef}></div>
				</div>
				{FooterComponent()}
			</>
		);
	}

	return (
		<Container fluid className="vh-100">
			<Row className="h-100">
				<Col
					xs={12}
					lg={3}
					className={`d-flex flex-column p-0 px-2 position-relative bg-dark border-end border-black ${isSidebarOpen ? "d-block" : "d-none d-lg-block"}`}
				>
					{Sidebar()}
					<Button className="bg-transparent border-0 position-absolute bottom-0 end-0 mb-2 z-3">
						<IoIosAddCircleOutline
							fill="blue"
							size={30}
							className={`${styles.iconHover}`}
						></IoIosAddCircleOutline>
					</Button>
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
