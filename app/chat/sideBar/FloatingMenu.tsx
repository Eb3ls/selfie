import { ChatModal } from "@/app/chat/sideBar/ChatModal";
import { GroupChatModal } from "@/app/chat/sideBar/GroupChatModal";
import { useState } from "react";
import React from "react";
import { Button } from "react-bootstrap";
import { IoIosAddCircleOutline, IoIosClose } from "react-icons/io";

export function FloatingMenu() {
	const [showOptions, setShowOptions] = useState(false);

	return (
		<div className="position-relative" style={{ zIndex: 100 }}>
			{/* Menu con le opzioni */}
			{showOptions && (
				<div
					className="position-absolute end-0 top-100 mt-2"
					style={{ width: "200px" }}
				>
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
				</div>
			)}

			{/* Pulsante principale */}
			<Button
				variant="primary"
				className="p-2 rounded-circle d-flex align-items-center justify-content-center shadow-sm hover-shadow transition-all"
				style={{
					width: "42px",
					height: "42px"
				}}
				onClick={() => setShowOptions(!showOptions)}
			>
				{showOptions ? (
					<IoIosClose className="text-white" size={24} />
				) : (
					<IoIosAddCircleOutline className="text-white" size={24} />
				)}
			</Button>
		</div>
	);
}
