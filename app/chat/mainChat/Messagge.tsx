export default function MessageComponent({ msg }: any) {
	return (
		<div
			className={`d-flex ${msg.sender === "Io" ? "justify-content-end" : "justify-content-start"} mb-2`}
		>
			<div
				className={`p-2 px-4 rounded-top text-break ${msg.sender === "Io" ? "bg-primary text-white rounded-start" : "bg-light text-dark rounded-end"}`}
				style={{ maxWidth: "65%" }}
			>
				<div>{msg.text}</div>
				<div className="text-end">{msg.date}</div>
			</div>
		</div>
	);
}
