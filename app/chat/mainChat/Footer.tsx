import React from "react";
import { Button, Form, InputGroup } from "react-bootstrap";
import { IoIosSend } from "react-icons/io";
import { chatFooter } from "../../color_palette";
import "../chat.css";

interface FooterProps {
	setNewMessage: React.Dispatch<React.SetStateAction<string>>;
	newMessage: string;
	sendMessage: () => void;
}

export default function Footer({
	setNewMessage,
	newMessage,
	sendMessage
}: FooterProps) {
	return (
		<div
			className="p-3 mb-3 rounded-pill w-50 mx-auto"
			style={{ backgroundColor: chatFooter }}
		>
			<InputGroup>
				<Form.Control
					type="text"
					name="chatInput"
					placeholder="Scrivi un messaggio..."
					value={newMessage}
					className={`bg-transparent border-0 text-white chatInput`}
					onChange={(e) => setNewMessage(e.target.value)}
				/>
				<Button
					className="bg-transparent border-0"
					onClick={sendMessage}
				>
					<IoIosSend fill="white" size={30} className="iconHover" />
				</Button>
			</InputGroup>
		</div>
	);
}
