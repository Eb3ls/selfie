import { Form, InputGroup } from "react-bootstrap";
import { FaSearch } from "react-icons/fa";

interface SideBarHeaderProps {
	searchTerm: string;
	setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
}

export default function SideBarHeader({
	searchTerm,
	setSearchTerm
}: SideBarHeaderProps) {
	return (
		<div
			className="d-flex justify-content-between p-1 mt-2 z-2"
			style={{
				position: "sticky",
				top: 0
			}}
		>
			<InputGroup>
				<Form.Control
					type="text"
					name="searchUsersBar"
					placeholder="Cerca utenti..."
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
				/>
				<InputGroup.Text>
					<FaSearch />
				</InputGroup.Text>
			</InputGroup>
		</div>
	);
}
