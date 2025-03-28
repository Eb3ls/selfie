import { Alarm } from "@/utils/db/models/Alarm";
import { ConvertToString } from "@/utils/db/models/ModelConverter";
import { timeMachine } from "@/utils/timeMachine/timeMachine";
import { ObjectId } from "mongodb";

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
		| "DROPPED";
	dtStart: Date;					// Data di inizio dell'attività - coincide con dtStamp, le attività hanno solo scadenza
	due: Date;						// Data di scadenza dell'attività
	dtStamp: Date;					// Data di creazione dell'attività
	isMilestone: boolean;			// Se è una milestone
	isOverdue: boolean;				// Se è in ritardo
	ownerId: ObjectId;				// Proprietario dell'progetto
	prevIdList: ObjectId[];
	nextIdList: ObjectId[];
	phaseId: ObjectId;				// Fase a cui appartiene
	projectId: ObjectId;			// Progetto a cui appartiene
	userIdList: ObjectId[];			// Utenti dell'attività, sottoinsieme degli utenti del progetto
	alarms: Alarm[];				// Notifiche associate all'attività
	noteId: ObjectId;				// Nota assoiciata all'attività - può non esserci
}

export type StringProjectActivity = ConvertToString<ProjectActivity>;

export function createProjectActivity({
	summary = "",
	description = "",
	status = "ACTIVABLE",
	dtStart = timeMachine.timeMachineTime,
	due = timeMachine.timeMachineTime,
	dtStamp = timeMachine.timeMachineTime,
	isMilestone = false,
	isOverdue = false,
	ownerId = new ObjectId(),
	prevIdList = [],
	nextIdList = [],
	phaseId = new ObjectId(),
	projectId = new ObjectId(),
	userIdList = [],
	alarms = [],
	noteId = new ObjectId(),
}: Partial<ProjectActivity>): ProjectActivity {
	return {
		summary: summary,
		description: description,
		status: status,
		dtStart: dtStart,
		due: due,
		dtStamp: dtStamp,
		isMilestone: isMilestone,
		isOverdue: isOverdue,
		ownerId: ownerId,
		prevIdList: prevIdList,
		nextIdList: nextIdList,
		phaseId: phaseId,
		projectId: projectId,
		userIdList: userIdList,
		alarms: alarms,
		noteId: noteId,
	};
}
