import { useEffect, useState } from "react";
import { Button, Form } from "react-bootstrap";
import { FaTrash, FaUser } from "react-icons/fa";

interface InvitationComponentProps {
	mainId: string;
	usernameList: string[];
	setUsernameList: (usernameList: string[]) => void;
}

export function InvitationComponent({
	mainId,
	usernameList,
	setUsernameList
}: InvitationComponentProps) {
	const [currentMainId, setCurrentMainId] = useState("");
	const [currentOriginalUL, setCurrentOriginalUL] = useState([] as string[]);

	// Se cambia l'id dell'attività, aggiorna la lista degli utenti che erano già presenti
	useEffect(() => {
		if (currentMainId !== mainId) {
			setCurrentMainId(mainId);
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
			<Form.Label>Inviti</Form.Label>
			<div className="d-flex">
				<Form.Control
					type="text"
					value={usernameInput}
					onChange={(e) => setUsernameInput(e.target.value)}
					placeholder="Inserisci nome utente"
					className="input-field"
				/>
				<Button
					variant="success"
					onClick={handleAddUsername}
					style={{ marginLeft: "10px" }}
					type="button"
				>
					+
				</Button>
			</div>
			<div className="mt-3">
				{oldUsernames.length > 0 && (
					<>
						<h6 className="mb-2">Utenti già presenti:</h6>
						<div className="border rounded p-2">
							{oldUsernames.map((username) => (
								<div
									key={username}
									className="d-flex justify-content-between align-items-center p-2"
								>
									<div className="d-flex align-items-center">
										<FaUser className="text-secondary me-2" />
										<span>{username}</span>
									</div>
									<Button
										variant="link"
										className="text-danger p-1"
										onClick={() =>
											handleRemoveUsername(username)
										}
									>
										<FaTrash size={14} />
									</Button>
								</div>
							))}
						</div>
					</>
				)}

				{newUsernames.length > 0 && (
					<>
						<h6 className="mt-3 mb-2">Utenti da invitare:</h6>
						<div className="border rounded p-2">
							{newUsernames.map((username) => (
								<div
									key={username}
									className="d-flex justify-content-between align-items-center p-2"
								>
									<div className="d-flex align-items-center">
										<FaUser className="text-secondary me-2" />
										<span>{username}</span>
									</div>
									<Button
										variant="link"
										className="text-danger p-1"
										onClick={() =>
											handleRemoveUsername(username)
										}
									>
										<FaTrash size={14} />
									</Button>
								</div>
							))}
						</div>
					</>
				)}
			</div>
		</Form.Group>
	);
}
