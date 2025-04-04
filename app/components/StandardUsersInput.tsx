import { useEffect, useState } from "react";
import { Button, Form } from "react-bootstrap";
import { FaTrash, FaUser } from "react-icons/fa";

interface StandardUsersInputProps {
	mainId?: string;
	usernameList: string[];
	setUsernameList: (usernameList: string[]) => void;
}

export function StandardUsersInput({
	mainId,
	usernameList,
	setUsernameList
}: StandardUsersInputProps) {
	const [currentMainId, setCurrentMainId] = useState("");
	const [currentOriginalUL, setCurrentOriginalUL] = useState<string[]>([]);

	// Se cambia l'id dell'attività, aggiorna la lista degli utenti che erano già presenti
	useEffect(() => {
		if (currentMainId !== mainId) {
			setCurrentMainId(mainId || "");
			setCurrentOriginalUL(usernameList);
		}
	}, [mainId, currentMainId, usernameList]);

	// Troviamo gli utenti in usernameList che erano presenti anche in currentOriginalUsernameList
	// E troviamo gli utenti in currentOriginalUsernameList che non sono presenti in usernameList
	const oldUsernames = currentOriginalUL.filter((username) =>
		usernameList.includes(username)
	);
	const newUsernames = usernameList.filter(
		(username) => !currentOriginalUL.includes(username)
	);

	const [usernameInput, setUsernameInput] = useState("");

	// Funzione per aggiungere un invito
	const handleAddUsername = () => {
		if (!usernameInput.trim()) {
			return;
		}

		// Se l'utente è già presente, non fare nulla
		if (usernameList.includes(usernameInput.trim())) {
			setUsernameInput("");
			return;
		}

		setUsernameList([...usernameList, usernameInput.trim()]);
		setUsernameInput("");
	};

	// Funzione per rimuovere un utente
	const handleRemoveUsername = (usernameToRemove: string) => {
		setUsernameList(
			usernameList.filter((username) => username !== usernameToRemove)
		);
	};

	return (
		<Form.Group className="mb-3">
			<Form.Label className="fw-bold">Inviti</Form.Label>
			<div className="d-flex">
				<Form.Control
					type="text"
					value={usernameInput}
					onChange={(e) => setUsernameInput(e.target.value)}
					placeholder="Inserisci nome utente"
					className="input-field"
				/>
				<Button
					className="ms-2 rounded-3 hover-lift"
					variant="primary"
					onClick={handleAddUsername}
					type="button"
				>
					+
				</Button>
			</div>
			<div className="mt-3">
				{oldUsernames.length > 0 && (
					<div className="mb-4">
						<h6 className="text-muted mb-3">
							Utenti già aggiunti:
						</h6>
						<div
							className="list-group shadow-sm"
							style={{ maxHeight: "200px", overflowY: "auto" }}
						>
							{oldUsernames.map((username) => (
								<div
									key={username}
									className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
								>
									<div className="d-flex align-items-center">
										<FaUser className="text-primary me-3" />
										<span className="fw-medium">
											username
										</span>
									</div>
									<Button
										variant="link"
										className="text-danger p-1"
										onClick={() =>
											handleRemoveUsername(username)
										}
									>
										<FaTrash
											size={14}
											className="hover-grow"
										/>
									</Button>
								</div>
							))}
						</div>
					</div>
				)}

				{newUsernames.length > 0 && (
					<div>
						<h6 className="text-muted mb-3">Utenti da invitare</h6>
						<div
							className="list-group shadow-sm"
							style={{ maxHeight: "200px", overflowY: "auto" }}
						>
							{newUsernames.map((username) => (
								<div
									key={username}
									className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
								>
									<div className="d-flex align-items-center">
										<FaUser className="text-primary me-3" />
										<span className="fw-medium">
											{username}
										</span>
									</div>
									<Button
										variant="link"
										className="text-danger p-1"
										onClick={() =>
											handleRemoveUsername(username)
										}
									>
										<FaTrash
											size={14}
											className="hover-grow"
										/>
									</Button>
								</div>
							))}
						</div>
					</div>
				)}
			</div>
		</Form.Group>
	);
}
