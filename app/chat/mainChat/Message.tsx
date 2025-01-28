import "./Message.css";

type MinMessage = {
	_id: number;
	owner: string;
	content: string;
	sentAt: string;
};

export function Message({ msg }: { msg: MinMessage }) {
	const isOwn = msg.owner === "Io";

	return (
		<div className={`message-wrapper ${isOwn ? "message-own" : "message-other"}`}>
			{!isOwn && (
				// Posizionato in basso a sinistra
				<div className="message-avatar d-flex align-items-end">
					<div className="avatar-circle">
						<small>{msg.owner[0]}</small>
					</div>
				</div>
			)}

			<div className={`message-bubble ${isOwn ? "bubble-own" : "bubble-other"}`}>
				<div className="message-content">{msg.content}</div>
				<div className="message-time">{msg.sentAt}</div>
			</div>
		</div>
	);
}
