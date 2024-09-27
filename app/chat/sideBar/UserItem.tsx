import { Container, ListGroup } from "react-bootstrap";
import { IoPersonCircleOutline } from "react-icons/io5";
import "../chat.css";

interface UserItemProps {
	user: string;
	loadChat: (user: string) => void;
	data: any;
}

export default function UserItemComponent({
	user,
	loadChat,
	data
}: UserItemProps) {
	return (
		<ListGroup.Item
			action
			className={`fw-bold p-2 ps-4 rounded-pill border-0 d-flex align-items-center bg-transparent text-white userHover`}
			onClick={() => loadChat(user)}
		>
			<IoPersonCircleOutline
				size={35}
				className="me-2 flex-shrink-0"
				style={{ minWidth: "35px" }}
			/>
			<Container className="d-flex flex-column justify-content-center overflow-hidden">
				<h5 className="fw-bold m-0 text-truncate">{user}</h5>{" "}
				<p
					className="m-0 fw-semibold text-truncate"
					style={{ fontSize: "0.8rem" }}
				>
					{data[user][data[user].length - 1].sender + ": "}
					<span className="fw-normal text-truncate">
						{data[user][data[user].length - 1].text}
					</span>
				</p>
			</Container>
		</ListGroup.Item>
	);
}
