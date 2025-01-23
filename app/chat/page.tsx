"use client";

// Componenti e stili
import "@/app/chat/chat.css";
import { ChatEntry, ChatResponse, UserElement } from "@/app/chat/chatTypes";
import { Footer } from "@/app/chat/mainChat/Footer";
import { Header } from "@/app/chat/mainChat/Header";
import { Message } from "@/app/chat/mainChat/Message";
import { FloatingMenu } from "@/app/chat/sideBar/FloatingMenu";
import { SideBarHeader } from "@/app/chat/sideBar/SideBarHeader";
import { UserItem } from "@/app/chat/sideBar/UserItem";
import { chatBody } from "@/app/color_palette";
// Librerie
import { StringMessage } from "@/utils/db/db";
import React, { useEffect, useRef, useState } from "react";
import { Col, Container, ListGroup, Row } from "react-bootstrap";
import useSWR from "swr";

async function fetcher(url: string) {
	const response = await fetch(url);
	if (!response.ok) {
		alert("Errore durante il fetch delle note!");
	}
	return response.json();
}

function fromIdToUsername(
	id: string,
	userList: UserElement[]
): string | undefined {
	const user = userList.find((user) => user._id === id);
	return user?.username;
}

export default function ChatMain() {
	const [chatResponse, setChatResponse] = useState<ChatResponse | null>(null); // Risposta della API per la lista di chat
	const [selectedChat, setSelectedChat] = useState<ChatEntry | null>(null); // Chat selezionata
	const [currentMessages, setCurrentMessages] = useState<StringMessage[]>([]); // Messaggi della chat corrente

	const [newMessage, setNewMessage] = useState<string>(""); // Nuovo messaggio da inviare
	const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Sidebar aperta o chiusa

	const chatEndRef = useRef<HTMLDivElement>(null); // Riferimento all'ultimo messaggio della chat

	// Fetch dei dati dei contatti a sinistra
	const { data: raw_contacts, error: error_contacts } = useSWR(
		"/api/chat/getContacts",
		fetcher,
		{
			revalidateOnFocus: false // Disabilita il refetch quando si torna alla finestra
		}
	);

	// Aggiorna chatResponse quando i dati vengono recuperati
	useEffect(() => {
		if (raw_contacts) {
			setChatResponse(raw_contacts);
		}
	}, [raw_contacts]);

	// Fetch della lista di messaggi
	const {
		data: raw_message_list,
		error: error_message_list,
		mutate: mutate
	} = useSWR(
		selectedChat !== null && selectedChat?._id
			? "/api/chat/" + selectedChat?._id + "/get"
			: null,
		fetcher,
		{
			refreshInterval: 5000, // Ricarica i dati ogni 5 secondi
			revalidateOnFocus: false // Disabilita il refetch quando si torna alla finestra
		}
	);

	// Aggiorna currentMessages quando i dati vengono recuperati
	useEffect(() => {
		if (raw_message_list) {
			setCurrentMessages(raw_message_list.messages);
		}
	}, [raw_message_list]);

	// Funzione per scrollare automaticamente alla fine della chat
	function scrollToBottom() {
		if (chatEndRef.current) {
			chatEndRef.current.scrollIntoView({ behavior: "smooth" });
		}
	}

	// Scrolla automaticamente alla fine della chat quando si aggiunge un nuovo messaggio
	useEffect(() => {
		scrollToBottom();
	}, [currentMessages]);

	// Funzione per inviare un messaggio
	async function sendMessage() {
		if (newMessage.trim() === "" || selectedChat === null) return;

		const response = await fetch(
			"/api/chat/" + selectedChat._id + "/push",
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({ content: newMessage })
			}
		);

		if (response.ok) {
			// Aggiorno i messaggi
			const newMessageObj: StringMessage = {
				ownerId: chatResponse?.whoAmI._id!,
				content: newMessage,
				sentAt: new Date().toISOString()
			};
			setCurrentMessages([...currentMessages, newMessageObj]);
		} else {
			alert("Errore nell'invio del messaggio");
		}

		setNewMessage("");
		scrollToBottom();
		mutate();
	}

	// Funzione per caricare la chat con un utente
	function loadChat(chatId: string) {
		// Recupero la chat selezionata dalla lista di chat
		const requestedChat = chatResponse?.chatList.find(
			(chat) => chat._id === chatId
		);

		if (requestedChat === undefined) {
			alert("Errore durante il caricamento della chat");
			return;
		}

		setSelectedChat(requestedChat);
		mutate();
		setIsSidebarOpen(false);
	}

	// Componente per la sidebar
	function Sidebar() {
		const [searchTerm, setSearchTerm] = useState("");

		// Filtraggio delle chat in base alla keyword di ricerca
		const filteredChats = [];

		for (const chat of chatResponse?.chatList || []) {
			// Filtra le chat in base alla keyword di ricerca solamente nel nome
			if (chat.summary.toLowerCase().includes(searchTerm.toLowerCase())) {
				const lastMessage = chat.lastMessage;
				const lastMessageObj = lastMessage
					? {
						name: fromIdToUsername(
							lastMessage.ownerId,
							chatResponse!.userList
						)!,
						content: lastMessage.content
					}
					: null;

				filteredChats.push({
					_id: chat._id,
					summary: chat.summary,
					lastMessage: lastMessageObj,
					loader: () => loadChat(chat._id)
				});
			}
		}

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
						{filteredChats.length > 0 ? (
							filteredChats.map((chat) => (
								<UserItem
									key={chat._id}
									entry={chat}
									setSelectedChat={setSelectedChat}
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
		let index = 0;
		const translatedMessages = currentMessages.map((message) => {
			const newOwner =
				chatResponse!.whoAmI._id === message.ownerId
					? "Io"
					: fromIdToUsername(
						message.ownerId,
						chatResponse!.userList
					)!;
			const newSentAt = new Date(message.sentAt).toLocaleTimeString([], {
				hour: "2-digit",
				minute: "2-digit"
			});
			return {
				_id: index++,
				owner: newOwner,
				content: message.content,
				sentAt: newSentAt
			};
		});
		return (
			<>
				<Header
					chatSummary={selectedChat?.summary}
					setSelectedChat={setSelectedChat}
					setIsSidebarOpen={setIsSidebarOpen}
				></Header>
				<div className="flex-grow-1 overflow-auto p-3">
					{translatedMessages.map((message) => (
						<Message key={message._id} msg={message} />
					))}
					<div ref={chatEndRef}></div>
				</div>
				<Footer
					newMessage={newMessage}
					setNewMessage={setNewMessage}
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
					{selectedChat && MainChatComponent()}
				</Col>
			</Row>
		</Container>
	);
}

//TODO quando si restring troppo l'header fa overflow-x
