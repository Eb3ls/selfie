import { ChatModal } from "@/app/chat/sideBar/ChatModal";
import { GroupChatModal } from "@/app/chat/sideBar/GroupChatModal";
import { useState } from "react";
import React from "react";
import { Button } from "react-bootstrap";
import { FaComment, FaUserGroup } from "react-icons/fa6";
import { IoIosAdd } from "react-icons/io";

interface FloatingMenuProps {
	updateChatList: () => void;
}

export function FloatingMenu({ updateChatList }: FloatingMenuProps) {
	const [showOptions, setShowOptions] = useState(false);

	return (
		<div
			className="position-relative d-flex align-items-center"
			style={{ zIndex: 100 }}
		>
			{/* Menu with options in a dropdown */}
			<div
				className={`dropdown-menu ${showOptions ? "show" : ""} shadow-sm`}
				style={{
					position: "absolute",
					right: 0,
					top: "100%",
					marginTop: "0.5rem",
					minWidth: "200px"
				}}
			>
				<ChatModal
					updateChatList={updateChatList}
					setShowOptions={setShowOptions}
				>
					<Button
						variant="light"
						className="dropdown-item d-flex align-items-center gap-2"
					>
						<FaComment
							className="text-primary d-flex justify-content-center"
							size={15}
						/>
						Crea nuova chat
					</Button>
				</ChatModal>
				<GroupChatModal
					updateChatList={updateChatList}
					setShowOptions={setShowOptions}
				>
					<Button
						variant="light"
						className="dropdown-item d-flex align-items-center gap-2"
					>
						<FaUserGroup
							className="text-primary d-flex justify-content-center"
							size={15}
						/>
						Crea nuovo gruppo
					</Button>
				</GroupChatModal>
			</div>

			{/* Main button */}
			<Button
				variant="primary"
				className="rounded-circle d-flex align-items-center justify-content-center shadow-sm p-0"
				style={{
					width: "30px",
					height: "30px",
					transition: "transform 0.2s ease",
					transform: showOptions ? "rotate(135deg)" : "rotate(0deg)"
				}}
				onClick={() => setShowOptions(!showOptions)}
			>
				<IoIosAdd size={28} />
			</Button>
		</div>
	);
}
