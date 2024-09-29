import { ChatEntry } from "@/app/chat/chatTypes";
import { Button, Form } from "react-bootstrap";
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
		<div className="bg-dark text-white p-3 border-bottom border-black d-flex align-items-center justify-content-end">
			<Button
				variant="link"
				className="d-block d-ld-none"
				onClick={() => {
					setIsSidebarOpen(true);
					setSelectedChat(null);
				}}
			>
				<FaArrowLeft fill="white" size={30}></FaArrowLeft>
			</Button>
			<h2 className="text-center m-0 mx-3 fw-bold flex-grow-1">
				{chatSummary}
			</h2>
			<Form.Control
				type="text"
				name="topSearchBar"
				placeholder="Cerca..."
				className="me-3 w-auto"
			/>
			<Button variant="outline-primary">Opzioni</Button>
		</div>
	);
}
