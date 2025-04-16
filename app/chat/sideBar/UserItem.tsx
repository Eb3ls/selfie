import { DeleteModal } from "@/app/chat/sideBar/DeleteModal";
import "@/app/chat/styles.css";
import { DEFAULT_PROFILE_URL } from "@/app/constants";
import Image from "next/image";
import { useState } from "react";
import { Container } from "react-bootstrap";
import { IoPeopleCircleOutline, IoTrash } from "react-icons/io5";

type SidebarEntry = {
	_id: string;
	isGroup: boolean;
	imageId: string | undefined;
	summary: string;
	lastMessage: { name: string; content: string } | null;
	canIDelete: boolean;
	loader: () => void;
};

export function UserItem({
	entry,
	setSelectedChat,
	updateChatList
}: {
	entry: SidebarEntry;
	setSelectedChat: any;
	updateChatList: () => void;
}) {
	const [fetchImageError, setFetchImageError] = useState(false);

	let iconToShow;

	if (entry.isGroup) {
		iconToShow = (
			<IoPeopleCircleOutline
				size={45}
				className="flex-shrink-0 text-primary"
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
		<div
			className={`fw-bold p-3 mb-3 rounded-4 border d-flex align-items-center position-relative hover-shadow hover-lift`}
			onClick={entry.loader}
			style={{ minHeight: "81px", cursor: "pointer" }}
		>
			<div className="position-relative">{iconToShow}</div>

			<Container className="d-flex flex-column justify-content-center m-0 overflow-hidden">
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

			{entry.canIDelete && (
				<DeleteModal
					chat_id={entry._id}
					setSelectedChat={setSelectedChat}
					updateChatList={updateChatList}
				>
					<Container className="rounded-circle p-2 delete-btn">
						<IoTrash className="icon text-danger" size={24} />
					</Container>
				</DeleteModal>
			)}
		</div>
	);
}
