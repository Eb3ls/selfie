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
			className="text-dark p-3 border-bottom d-flex align-items-center justify-content-start bg-light position-relative"
			style={{ zIndex: 1000 }}
		>
			<Button
				variant="link"
				className="d-block d-ld-none"
				onClick={() => {
					setIsSidebarOpen(true);
					setSelectedChat(null);
				}}
			>
				<FaArrowLeft fill="black" size={28}></FaArrowLeft>
			</Button>
			<h3 className="text-center fw-bold flex-grow-1 position-absolute top-50 start-50 translate-middle">
				{chatSummary}
			</h3>
		</div>
	);
}
