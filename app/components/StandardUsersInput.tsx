import { useState } from "react";

interface StandardUsersInputProps {
	title: string;
	placeholder: string;
	usernameList: string[];
	setUsernameList: React.Dispatch<React.SetStateAction<string[]>>;
}

export default function StandardUsersInput({
	title,
	placeholder,
	usernameList,
	setUsernameList
}: StandardUsersInputProps) {
	const [username, setUsername] = useState<string>("");

	function handleAddUser() {
		if (!username) return;

		if (usernameList.includes(username)) {
			// TODO mettere messaggio di errore
			alert("Username already exists");
			return;
		}

		setUsernameList([...usernameList, username]);
		setUsername("");
	}

	function handleRemoveUser(usernameToRemove: string) {
		setUsernameList((prevList) =>
			prevList.filter((user) => user !== usernameToRemove)
		);
	}

	function createUserEntry(username: string) {
		return (
			<div className="d-flex align-items-center justify-content-center gap-2 mb-2 bg-light rounded-3 p-2">
				<i className="bi bi-person-fill"></i>
				<span className="text-truncate">{username}</span>
				<button
					type="button"
					className="btn btn-sm btn-outline-danger ms-auto"
					onClick={() => handleRemoveUser(username)}
				>
					<i className="bi bi-x"></i>
				</button>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-4">
			<label className="form-label fw-bold">{title}</label>
			<div className="input-group mb-3">
				<input
					type="text"
					value={username}
					className="form-control"
					placeholder={placeholder}
					onChange={(e) => setUsername(e.target.value)}
				/>
				<button
					type="button"
					className="btn btn-primary"
					onClick={handleAddUser}
				>
					<i className="bi bi-plus"></i>
				</button>
			</div>
			<div
				className="overflow-y-auto py-2"
				style={{ maxHeight: "500px" }}
			>
				{usernameList.map((username) => createUserEntry(username))}
			</div>
		</div>
	);
}
