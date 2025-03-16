import "@/app/chat/chat.css";
import { DeleteModal } from "@/app/chat/sideBar/DeleteModal";
import { Container, ListGroup } from "react-bootstrap";
import { IoPersonCircleOutline, IoTrash } from "react-icons/io5";

type SidebarEntry = {
	_id: string;
	summary: string;
	lastMessage: { name: string; content: string } | null;
	loader: () => void;
};

export function UserItem({
	entry,
	setSelectedChat
}: {
	entry: SidebarEntry;
	setSelectedChat: any;
}) {
	return (
		<ListGroup.Item
			action
			className={`fw-bold p-3 rounded-3 border-0 d-flex align-items-center bg-transparent text-white userHover position-relative`}
			onClick={entry.loader}
			style={{
				transition: "all 0.2s ease-in-out",
				marginBottom: "0.5rem"
			}}
		>
			<div className="position-relative">
				<IoPersonCircleOutline
					size={45}
					className="me-3 flex-shrink-0 text-primary"
					style={{
						minWidth: "45px",
						transition: "transform 0.2s ease"
					}}
				/>
			</div>

			<Container className="d-flex flex-column justify-content-center m-0 overflow-hidden py-1">
				<h5
					className="fw-bold m-0 text-truncate mb-1"
					style={{ fontSize: "1.1rem" }}
				>
					{entry.summary}
				</h5>
				{entry.lastMessage && (
					<p
						className="m-0 text-truncate opacity-75"
						style={{ fontSize: "0.9rem" }}
					>
						<span className="fw-semibold">
							{entry.lastMessage.name}:{" "}
						</span>
						<span className="fw-normal">
							{entry.lastMessage.content}
						</span>
					</p>
				)}
			</Container>

			<DeleteModal
				chat_id={entry._id}
				setSelectedChat={setSelectedChat}
				className="ms-3"
			>
				<Container
					className="rounded-circle p-2 delete-btn"
					style={{
						backgroundColor: "rgba(220, 53, 69, 0.1)",
						transition: "all 0.2s ease"
					}}
				>
					<IoTrash className="text-danger" size={20} />
				</Container>
			</DeleteModal>
		</ListGroup.Item>
	);
}
