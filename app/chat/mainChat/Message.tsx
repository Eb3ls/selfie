type MinMessage = {
	_id: number;
	owner: string;
	content: string;
	sentAt: string;
};

export function Message({ msg }: { msg: MinMessage }) {
	return (
		<div
			className={`d-flex ${msg.owner === "Io" ? "justify-content-end" : "justify-content-start"} mb-2`}
		>
			<div
				className={`p-2 px-4 rounded-top text-break ${msg.owner === "Io" ? "bg-primary text-white rounded-start" : "bg-light text-dark rounded-end"}`}
				style={{ maxWidth: "65%" }}
			>
				<div>{msg.content}</div>
				<div className="text-end">{msg.sentAt}</div>
			</div>
		</div>
	);
}
