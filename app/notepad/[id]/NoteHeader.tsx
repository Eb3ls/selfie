import { Button } from "react-bootstrap";
import { FaGear } from "react-icons/fa6";
import { EditNoteModal } from "./EditNoteModal";

interface NoteHeaderProps {
	ownerId: string;
	userId?: string;
	summary: string;
	note: any;
	mutate: () => void;
	handleSave: () => Promise<void>;
}

export function NoteHeader({
	ownerId,
	userId,
	summary,
	note,
	mutate,
	handleSave
}: NoteHeaderProps) {
	return (
		<div className="pt-4 pb-2 border-bottom d-flex justify-content-between align-items-center flex-shrink-0">
			<h1 className="fs-2 text-truncate">{summary}</h1>
			<div className="d-flex align-items-center gap-2">
				{ownerId === userId && (
					<EditNoteModal note={note} mutate={mutate}>
						<button className="btn btn-light">
							<FaGear size={20} />
						</button>
					</EditNoteModal>
				)}
				<Button variant="primary" onClick={handleSave}>
					Salva
				</Button>
			</div>
		</div>
	);
}
