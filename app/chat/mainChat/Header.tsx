import { ChatEntry } from "@/app/chat/chatTypes";
import { Button } from "react-bootstrap";
import { FaArrowLeft } from "react-icons/fa";

interface HeaderProps {
	chatSummary: string | undefined;
	setSelectedChat: React.Dispatch<React.SetStateAction<ChatEntry | null>>;
	setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export function Header({
	chatSummary,
	setSelectedChat,
	setIsSidebarOpen
}: HeaderProps) {
	return (
		<div
			className="text-dark p-3 border-bottom d-flex align-items-center justify-content-start bg-light sticky-top"
			style={{ minHeight: "75px", zIndex: 101 }}
		>
			<Button
				variant="link"
				className="d-lg-none d-flex align-items-center me-2"
				onClick={() => {
					setIsSidebarOpen(true);
					setSelectedChat(null);
				}}
			>
				<FaArrowLeft fill="black" size={20}></FaArrowLeft>
			</Button>
			<h3 className="text-center fw-bold flex-grow-1 text-truncate m-0">
				{chatSummary}
			</h3>
			<div className="d-block d-lg-none" style={{ minWidth: 34 }} />
		</div>
	);
}
