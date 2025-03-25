import { DEFAULT_PROFILE_URL } from "@/app/constants";
import Image from "next/image";
import { useState } from "react";
import "./Message.css";

type MinMessage = {
	_id: number;
	owner: string;
	ownerId: string;
	content: string;
	sentAt: string;
};

export function Message({ msg }: { msg: MinMessage }) {
	const [fetchImageError, setFetchImageError] = useState(false);

	const isOwn = msg.owner === "Io";

	return (
		<div
			className={`message-wrapper ${isOwn ? "message-own" : "message-other"}`}
		>
			{!isOwn && (
				// Posizionato in basso a sinistra
				<div className="message-avatar d-flex align-items-end">
					<div
						title={msg.owner}
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
									: DEFAULT_PROFILE_URL + msg.ownerId ||
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
				</div>
			)}

			<div
				className={`message-bubble ${isOwn ? "bubble-own" : "bubble-other"}`}
			>
				<div className="message-content">{msg.content}</div>
				<div className="message-time">{msg.sentAt}</div>
			</div>
		</div>
	);
}
