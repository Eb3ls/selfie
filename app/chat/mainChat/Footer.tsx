import "@/app/chat/styles.css";
import React from "react";
import { Button, Form, InputGroup } from "react-bootstrap";
import { IoIosSend } from "react-icons/io";

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
		<div className="d-flex justify-content-center bg-white shadow-sm sticky-bottom">
			<div
				className="p-3 m-3 rounded-pill w-lg-50 mx-auto bg-light d-flex align-items-center justify-content-center"
				style={{ width: "80%" }}
			>
				<InputGroup className="border-0">
					<Form.Control
						type="text"
						name="chatInput"
						placeholder="Scrivi un messaggio..."
						value={newMessage}
						className="bg-transparent border-0"
						onChange={(e) => setNewMessage(e.target.value)}
						onKeyDown={handleKeyPress}
						autoComplete="off"
						style={{ boxShadow: "none" }}
					/>
					<Button
						className="bg-transparent border-0 me-3"
						onClick={sendMessage}
						tabIndex={-1}
						style={{ outline: "none", boxShadow: "none" }}
					>
						<IoIosSend
							size={30}
							className="icon text-primary"
							style={{
								transition: "all 0.3s ease",
								cursor: "pointer"
							}}
						/>
					</Button>
				</InputGroup>
			</div>
		</div>
	);
}
