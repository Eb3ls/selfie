import { ChatModal } from "@/app/chat/sideBar/ChatModal";
import { GroupChatModal } from "@/app/chat/sideBar/GroupChatModal";
import { useState } from "react";
import React from "react";
import { Button } from "react-bootstrap";
import { IoIosAddCircleOutline, IoIosClose } from "react-icons/io";

export function FloatingMenu() {
	const [showOptions, setShowOptions] = useState(false);

	return (
		<div className="position-absolute d-flex flex-column bottom-0 end-0 me-2 mb-3 z-1">
			{/* Menu con le opzioni */}
			{showOptions && (
				<>
					<ChatModal>
						<Button variant="primary" className="mb-2 w-100">
							Crea nuova chat
						</Button>
					</ChatModal>
					<GroupChatModal className="pd-0">
						<Button variant="primary" className="mb-2 w-100">
							Crea nuovo gruppo
						</Button>
					</GroupChatModal>
				</>
			)}
			{/* Pulsante principale */}
			<Button
				className="p-1 rounded-circle align-self-end"
				onClick={() => {
					setShowOptions(!showOptions);
				}}
			>
				{showOptions ? (
					<IoIosClose fill="white" size={30} />
				) : (
					<IoIosAddCircleOutline fill="white" size={30} />
				)}
			</Button>
		</div>
	);
}
