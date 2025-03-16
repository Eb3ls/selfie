import "@/app/chat/chat.css";
import React from "react";
import { Button, Form, InputGroup } from "react-bootstrap";
import { IoIosSend } from "react-icons/io";
import "./Footer.css";

interface FooterProps {
	newMessage: string;
	setNewMessage: React.Dispatch<React.SetStateAction<string>>;
	sendMessage: () => void;
}

export function Footer({
	newMessage,
	setNewMessage,
	sendMessage
}: FooterProps) {
	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			sendMessage();
		}
	};

	return (
		<div className="p-3 mb-3 rounded-pill w-50 mx-auto chat-footer">
			<InputGroup className="border-0">
				<Form.Control
					type="text"
					name="chatInput"
					placeholder="Scrivi un messaggio..."
					value={newMessage}
					className="bg-transparent border-0 chat-input no-focus-outline"
					onChange={(e) => setNewMessage(e.target.value)}
					onKeyDown={handleKeyPress}
					autoComplete="off"
				/>
				<Button
					className="bg-transparent border-0 send-button"
					onClick={sendMessage}
				>
					<IoIosSend fill="white" size={24} className="send-icon" />
				</Button>
			</InputGroup>
		</div>
	);
}
