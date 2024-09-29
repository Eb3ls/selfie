import "@/app/chat/chat.css";
import { Container, ListGroup } from "react-bootstrap";
import { IoPersonCircleOutline } from "react-icons/io5";

type SidebarEntry = {
	_id: string;
	summary: string;
	lastMessage: { name: string; content: string } | null;
	loader: () => void;
};

export function UserItem({ entry }: { entry: SidebarEntry }) {
	return (
		<ListGroup.Item
			action
			className={`fw-bold p-2 ps-4 rounded-pill border-0 d-flex align-items-center bg-transparent text-white userHover`}
			onClick={entry.loader}
		>
			<IoPersonCircleOutline
				size={35}
				className="me-2 flex-shrink-0"
				style={{ minWidth: "35px" }}
			/>
			<Container className="d-flex flex-column justify-content-center m-0 overflow-hidden">
				<h5 className="fw-bold m-0 text-truncate">{entry.summary}</h5>{" "}
				{entry.lastMessage && (
					<p
						className="m-0 fw-semibold text-truncate"
						style={{ fontSize: "0.8rem" }}
					>
						{entry.lastMessage.name + ": "}
						<span className="fw-normal text-truncate">
							{entry.lastMessage.content}
						</span>
					</p>
				)}
			</Container>
		</ListGroup.Item>
	);
}
