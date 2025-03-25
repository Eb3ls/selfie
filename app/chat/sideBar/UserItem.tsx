import { DeleteModal } from "@/app/chat/sideBar/DeleteModal";
import "@/app/chat/styles.css";
import { DEFAULT_PROFILE_URL } from "@/app/constants";
import Image from "next/image";
import { useState } from "react";
import { Container, ListGroup } from "react-bootstrap";
import { IoPeopleCircleOutline, IoTrash } from "react-icons/io5";

type SidebarEntry = {
	_id: string;
	isGroup: boolean;
	imageId: string | undefined;
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
	const [fetchImageError, setFetchImageError] = useState(false);

	let iconToShow;

	if (entry.isGroup) {
		iconToShow = (
			<IoPeopleCircleOutline
				size={45}
				className="me-3 flex-shrink-0 text-primary"
				style={{
					minWidth: "45px",
					transition: "transform 0.2s ease"
				}}
			/>
		);
	} else {
		iconToShow = (
			<div
				style={{
					position: "relative",
					width: "45px",
					height: "45px",
					overflow: "hidden",
					borderRadius: "50%"
				}}
			>
				<Image
					src={
						fetchImageError
							? DEFAULT_PROFILE_URL
							: DEFAULT_PROFILE_URL + entry.imageId ||
								DEFAULT_PROFILE_URL
					}
					alt="Profile"
					sizes="500px"
					fill
					onError={() => setFetchImageError(true)}
					style={{
						objectFit: "cover"
					}}
				/>
			</div>
		);
	}

	return (
		<ListGroup.Item
			action
			className={`fw-bold p-3 my-2 rounded-4 border d-flex align-items-center position-relative hover-shadow`}
			onClick={entry.loader}
		>
			<div className="position-relative">{iconToShow}</div>

			<Container className="d-flex flex-column justify-content-center m-0 overflow-hidden py-1">
				<h5
					className="fw-bold m-0 text-truncate mb-1 text-dark"
					style={{ fontSize: "1.1rem" }}
				>
					{entry.summary}
				</h5>
				{entry.lastMessage && (
					<p
						className="m-0 text-truncate text-secondary"
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
				<Container className="rounded-circle p-2 delete-btn">
					<IoTrash className="icon text-danger" size={24} />
				</Container>
			</DeleteModal>
		</ListGroup.Item>
	);
}
