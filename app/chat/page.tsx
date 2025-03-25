"use client";

// Componenti e stili
import { ChatEntry, ChatResponse, UserElement } from "@/app/chat/chatTypes";
import { Footer } from "@/app/chat/mainChat/Footer";
import { Header } from "@/app/chat/mainChat/Header";
import { Message } from "@/app/chat/mainChat/Message";
import { SideBarHeader } from "@/app/chat/sideBar/SideBarHeader";
import { UserItem } from "@/app/chat/sideBar/UserItem";
import { GlobalSideBar } from "@/app/components/GlobalSideBar";
import { useTime } from "@/app/components/TimeContext";
// Librerie
import { StringMessage } from "@/utils/db/db";
import React, { Fragment, useEffect, useRef, useState } from "react";
import { ListGroup } from "react-bootstrap";
import useSWR from "swr";

async function fetcher(url: string) {
	const response = await fetch(url);
	if (!response.ok) {
		alert("Errore nell'ottenimento dei dati delle chat");
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

	const { dateTime } = useTime();

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
				sentAt: dateTime.toISOString()
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

				// imageId non dovrebbe esistere nei gruppi, perciò risulta undefined
				// È possibile controllare se è un gruppo controllando il campo isGroup
				// per evitare di utilizzare un imageId inesistente
				const imageId = chat.isGroup
					? undefined
					: chat.userIdList.find(
							(id) => id !== chatResponse?.whoAmI._id
						);

				filteredChats.push({
					_id: chat._id,
					isGroup: chat.isGroup,
					imageId: imageId,
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
					<ListGroup className="p-3">
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
			return {
				_id: index++,
				owner: newOwner,
				ownerId: message.ownerId,
				content: message.content,
				sentAt: message.sentAt
			};
		});

		translatedMessages.sort((a, b) => {
			const dateA = new Date(a.sentAt);
			const dateB = new Date(b.sentAt);
			return dateA.getTime() - dateB.getTime();
		});

		let lastDate = "0";
		const messageList = translatedMessages.map((message) => {
			const messageDate = new Date(message.sentAt);
			const messageDateFormatted = messageDate.toISOString().slice(0, 10);
			let newDate = false;
			if (lastDate !== messageDateFormatted) {
				lastDate = messageDateFormatted;
				newDate = true;
			}

			message.sentAt = new Date(message.sentAt).toLocaleTimeString([], {
				hour: "2-digit",
				minute: "2-digit"
			});

			if (messageDate)
				return (
					<Fragment key={message._id}>
						{newDate && (
							<div className="d-flex justify-content-center text-muted my-2">
								{messageDate.toDateString()}
							</div>
						)}
						<Message msg={message} />
					</Fragment>
				);
		});

		return (
			<>
				<Header
					chatSummary={selectedChat?.summary}
					setSelectedChat={setSelectedChat}
					setIsSidebarOpen={setIsSidebarOpen}
				></Header>
				<div className="flex-grow-1 overflow-auto p-3">
					{messageList}
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
		<div className="d-flex flex-column vh-100 ">
			<GlobalSideBar />
			<div className="d-flex flex-grow-1 overflow-hidden">
				{/* Sidebar */}
				<div
					className={`col-12 col-lg-4 col-xl-3 d-flex flex-column p-0 border-end ${
						isSidebarOpen ? "d-block" : "d-none d-lg-block"
					}`}
				>
					{Sidebar()}
				</div>

				{/* Chat principale */}
				<div
					className={`col flex-grow-1 d-flex flex-column p-0 ${
						isSidebarOpen ? "d-none d-lg-block" : "d-block"
					}`}
				>
					{selectedChat && MainChatComponent()}
				</div>
			</div>
		</div>
	);
}
