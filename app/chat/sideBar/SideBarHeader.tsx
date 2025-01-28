import { Form, InputGroup } from "react-bootstrap";
import { FaSearch } from "react-icons/fa";
import { FloatingMenu } from "./FloatingMenu";

interface SideBarHeaderProps {
	searchTerm: string;
	setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
}

export function SideBarHeader({
	searchTerm,
	setSearchTerm
}: SideBarHeaderProps) {
	return (
		<div
			className="d-flex justify-content-between p-1 mt-2"
			style={{
				position: "sticky",
				top: 0,
				zIndex: 1030
			}}
		>
			<InputGroup className="me-2" style={{ flex: 1 }}>
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
			<FloatingMenu />
		</div>
	);
}
