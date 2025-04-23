import { Button } from "react-bootstrap";
import { FaGear } from "react-icons/fa6";
import { EditNoteModal } from "./EditNoteModal";

interface NoteHeaderProps {
	ownerId: string;
	userId?: string;
	username: string;
	summary: string;
	note: any;
	mutate: () => void;
	handleSave: () => Promise<void>;
}

export function NoteHeader({
	ownerId,
	userId,
	username,
	summary,
	note,
	mutate,
	handleSave
}: NoteHeaderProps) {
	return (
		<div className="pt-4 pt-lg-0 pb-2 mt-4 border-bottom d-flex justify-content-between align-items-center flex-shrink-0">
			<h1 className="fs-1 text-truncate fw-bolder">{summary}</h1>
			<div className="d-flex align-items-center gap-2">
				{ownerId === userId && (
					<EditNoteModal note={note} mutate={mutate}>
						<button className="btn btn-light">
							<FaGear size={20} />
						</button>
					</EditNoteModal>
				)}
				{(note.userNameList.includes(username) ||
					note.access === "PUBLIC") && (
					<Button variant="primary" onClick={handleSave}>
						Salva
					</Button>
				)}
			</div>
		</div>
	);
}
