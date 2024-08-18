import { ObjectId } from "mongodb";
import { Alarm } from "@/db_utils/models/Alarm";

/*
COLLECTION
*/

export interface ProjectActivity {
	_id?: ObjectId;					// ID dell'Attività di progetto
	summary: string;				// Titolo dell'attività
	description: string;			// Descrizione dell'attività
	status: 
		| "WAITING"
		| "ACTIVABLE"
		| "ACTIVE"
		| "SUBMITTED"
		| "COMPLETED"
		| "REACTIVATED"
		| "OVERDUE"
		| "DROPPED";
	dtStart: Date;					// Data di inizio dell'attività - coincide con dtStamp, le attività hanno solo scadenza
	due: Date;						// Data di scadenza dell'attività
	dtStamp: Date;					// Data di creazione dell'attività
	isMilestone: boolean;			// Se è una milestone
	shifting: 
		| "TOSHIFT"
		| "FIXED"
		| "NONE";
	ownerId: ObjectId;				// Proprietario dell'progetto
	prevIds: ObjectId[];
	nextIds: ObjectId[];
	phaseId: ObjectId;				// Fase a cui appartiene
	projectId: ObjectId;			// Progetto a cui appartiene
	userList: ObjectId[];			// Utenti dell'attività, sottoinsieme degli utenti del progetto
	alarms: Alarm[];				// Notifiche associate all'attività
	noteId: ObjectId;				// Nota assoiciata all'attività - può non esserci
	noteLink: string | null;
}

export function createProjectActivity({
	summary = "",
	description = "",
	status = "WAITING",
	dtStart = new Date(),
	due = new Date(),
	dtStamp = new Date(),
	isMilestone = false,
	shifting = "NONE",
	ownerId = new ObjectId(),
	prevIds = [],
	nextIds = [],
	phaseId = new ObjectId(),
	projectId = new ObjectId(),
	userList = [],
	alarms = [],
	noteId = new ObjectId(),
	noteLink = null,
}: Partial<ProjectActivity>): ProjectActivity {
	return {
		summary: summary,
		description: description,
		status: status,
		dtStart: dtStart,
		due: due,
		dtStamp: dtStamp,
		isMilestone: isMilestone,
		shifting: shifting,
		ownerId: ownerId,
		prevIds: prevIds,
		nextIds: nextIds,
		phaseId: phaseId,
		projectId: projectId,
		userList: userList,
		alarms: alarms,
		noteId: noteId,
		noteLink: noteLink,
	};
}
