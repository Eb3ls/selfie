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
			className="d-flex justify-content-between p-3 border-bottom bg-light sticky-top"
			style={{ zIndex: 1 }}
		>
			<InputGroup
				className="ms-5 ps-2 me-2 ms-lg-0 ps-lg-0"
				style={{ flex: 1 }}
			>
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
