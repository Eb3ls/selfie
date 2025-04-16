import { Form, InputGroup } from "react-bootstrap";
import { FaSearch } from "react-icons/fa";
import { FloatingMenu } from "./FloatingMenu";

interface SideBarHeaderProps {
	searchTerm: string;
	setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
	updateChatList: () => void;
}

export function SideBarHeader({
	searchTerm,
	setSearchTerm,
	updateChatList
}: SideBarHeaderProps) {
	return (
		<div
			className="d-flex justify-content-between p-3 border-bottom bg-light sticky-top"
			style={{ zIndex: 1, minHeight: "75px" }}
		>
			<InputGroup className="ms-4 ps-3 me-2 ms-lg-0 ps-lg-0">
				<Form.Control
					type="text"
					name="searchUsersBar"
					className="p-0 ps-3"
					placeholder="Cerca utenti..."
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
				/>
				<InputGroup.Text className="border-start-0">
					<FaSearch size={20} className="text-secondary" />
				</InputGroup.Text>
			</InputGroup>
			<FloatingMenu updateChatList={updateChatList} />
		</div>
	);
}
