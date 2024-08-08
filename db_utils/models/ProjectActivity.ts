import { ObjectId } from "mongodb";
import { Alarm } from "@/db_utils/models/Alarm";

/*
COLLECTION
*/

export interface ProjectActivity {
	_id?: ObjectId; 				// ID dell'Attività di progetto
	summary: string; 				// Titolo dell'attività
	description: string; 			// Descrizione dell'attività
	status: string; 				// Stato dell'attività (iCalendar): NEEDS-ACTION, COMPLETED, IN-PROCESS, CANCELLED
	dtStart: Date;				 	// Data di inizio dell'attività - coincide con dtStamp, le attività hanno solo scadenza
	due: Date; 						// Data di scadenza dell'attività
	dtStamp: Date; 					// Data di creazione dell'attività
	categories: string[]; 			// Categorie dell'attività
	location: string; 				// Luogo dell'attività
	geo: string; 					// Geolocalizzazione dell'attività
	input: string; 					// Input ricevuto dall'attività precedente - può essere la data di fine dell'attività precedente, fa ritardare l'attività corrente
	output: string; 				// Output da dare all'attività successiva - può essere una data
	isMilestone: boolean; 			// Se è una milestone
	percentage: number; 			// Percentuale di completamento dell'attività
	parentId: ObjectId | null; 		// Attività precedente - può non esserci
	child: ObjectId | null; 		// Attività successiva - può non esserci
	phaseId: ObjectId; 				// Fase a cui appartiene
	userList: ObjectId[]; 			// Utenti dell'attività, sottoinsieme degli utenti del progetto
	alarms: Alarm[]; 				// Notifiche associate all'attività
	note: ObjectId | null; 			// Nota assoiciata all'attività - può non esserci
}

export function createProjectActivity({
	summary = "",
	description = "",
	status = "Not Started",
	dtStart = new Date(),
	due = new Date(),
	dtStamp = new Date(),
	categories = [],
	location = "",
	geo = "",
	input = "",
	output = "",
	isMilestone = false,
	percentage = 0,
	parentId = new ObjectId(),
	child = new ObjectId(),
	phaseId = new ObjectId(),
	userList = [],
	alarms = [],
	note = new ObjectId(),
}: Partial<ProjectActivity>): ProjectActivity {
	return {
		summary: summary,
		description: description,
		status: status,
		dtStart: dtStart,
		due: due,
		dtStamp: dtStamp,
		categories: categories,
		location: location,
		geo: geo,
		input: input,
		output: output,
		isMilestone: isMilestone,
		percentage: percentage,
		parentId: parentId,
		child: child,
		phaseId: phaseId,
		userList: userList,
		alarms: alarms,
		note: note,
	};
}
