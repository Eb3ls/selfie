import { Button, Form } from "react-bootstrap";
import { FaArrowLeft } from "react-icons/fa";

interface HeaderProps {
	setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
	setSelectedUser: React.Dispatch<React.SetStateAction<string | null>>;
	selectedUser: string | null;
}

export default function HeaderComponent({
	setIsSidebarOpen,
	setSelectedUser,
	selectedUser
}: HeaderProps) {
	return (
		<div className="bg-dark text-white p-3 border-bottom border-black d-flex align-items-center justify-content-end">
			<Button
				variant="link"
				className="d-block d-ld-none"
				onClick={() => {
					setIsSidebarOpen(true);
					setSelectedUser(null);
				}}
			>
				<FaArrowLeft fill="white" size={30}></FaArrowLeft>
			</Button>
			<h2 className="text-center m-0 mx-3 fw-bold flex-grow-1">
				{selectedUser}
			</h2>
			<Form.Control
				type="text"
				placeholder="Cerca..."
				className="me-3 w-auto"
			/>
			<Button variant="outline-primary">Opzioni</Button>
		</div>
	);
}
