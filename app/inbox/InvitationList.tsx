import { Button, Card } from "react-bootstrap";

type InvitationCardProps = {
	id: string;
	username: string;
	type: string;
	targetSummary: string;
	onAccept: (id: string) => void;
	onDecline: (id: string) => void;
};

const classes: { [key: string]: string } = {
	ACTIVITY: "bg-primary",
	EVENT: "bg-warning",
	SESSION: "bg-success",
	PROJECT: "bg-warning",
	NOTE: "bg-primary"
};

const names: { [key: string]: string } = {
	ACTIVITY: "Attività",
	EVENT: "Evento",
	SESSION: "Sessione",
	PROJECT: "Progetto",
	NOTE: "Nota"
};

function InvitationCard({
	id,
	username,
	type,
	targetSummary,
	onAccept,
	onDecline
}: InvitationCardProps) {
	const typeName = names[type] || "Attività";
	const typeClass = classes[type] || "bg-primary";

	return (
		<Card className="border-0 rounded-3 shadow-sm hover-shadow transition-all">
			<Card.Body className="p-4">
				<div className="d-flex flex-column gap-2">
					<div className="d-flex justify-content-between align-items-start">
						<div>
							<h5 className="fw-bold mb-1">{targetSummary}</h5>
							<p className="text-muted mb-0">Da: {username}</p>
						</div>
						<span className={`badge ${typeClass} rounded-pill`}>
							{typeName}
						</span>
					</div>
					<div className="d-flex flex-wrap gap-2 mt-3 w-100">
						<Button
							variant="outline-success"
							className="px-4 py-2 rounded-pill flex-grow-1 flex-sm-grow-0 d-inline-flex align-items-center justify-content-center"
							onClick={() => onAccept(id)}
						>
							<i className="bi bi-check-lg me-2"></i>
							<span>Accetta</span>
						</Button>
						<Button
							variant="outline-danger"
							className="px-4 py-2 rounded-pill flex-grow-1 flex-sm-grow-0 d-inline-flex align-items-center justify-content-center"
							onClick={() => onDecline(id)}
						>
							<i className="bi bi-x-lg me-2"></i>
							<span>Rifiuta</span>
						</Button>
					</div>
				</div>
			</Card.Body>
		</Card>
	);
}

export type Invitation = {
	_id: string;
	username: string;
	type: "ACTIVITY" | "EVENT" | "SESSION" | "PROJECT" | "NOTE";
	targetSummary: string;
};

type InvitationListProps = {
	invitations: Invitation[] | undefined;
	error: any;
	onAccept: (id: string) => void;
	onDecline: (id: string) => void;
};

export function InvitationList({
	invitations,
	error,
	onAccept,
	onDecline
}: InvitationListProps) {
	if (error) {
		return (
			<div className="alert alert-danger" role="alert">
				<i className="bi bi-exclamation-triangle me-2"></i>
				Errore nel caricamento degli inviti.
			</div>
		);
	}

	if (!invitations || invitations.length === 0) {
		return (
			<div className="text-center py-5">
				<i className="bi bi-inbox h1 text-muted"></i>
				<p className="text-muted mt-3 mb-0">Nessun invito trovato.</p>
			</div>
		);
	}

	return (
		<div className="d-flex flex-column gap-3">
			{invitations.map((invitation) => (
				<InvitationCard
					key={invitation._id}
					id={invitation._id}
					username={invitation.username}
					type={invitation.type}
					targetSummary={invitation.targetSummary}
					onAccept={onAccept}
					onDecline={onDecline}
				/>
			))}
		</div>
	);
}
