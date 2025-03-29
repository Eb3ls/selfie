import {
	IdArrayFields,
	IdFields,
	IdOrNullFields,
	generateMessageResponse,
	generateObjectResponse,
	stringsToObjectId
} from "@/utils/api/common";
import {
	INVITATION_COLLECTION,
	Invitation,
	Note,
	PHASE_COLLECTION,
	PROJECT_ACTIVITY_COLLECTION,
	Phase,
	ProjectActivity,
	StringInvitation,
	StringPhase,
	StringProjectActivity,
	USER_COLLECTION,
	User,
	addCollectionWrapper,
	createActivity,
	createAlarm,
	createChat,
	createDayInstance,
	createEvent,
	createGroupChat,
	createInvitation,
	createMessage,
	createNote,
	createPhase,
	createPomodoroSettings,
	createProject,
	createProjectActivity,
	createSession,
	createUser,
	deleteCollectionWrapper,
	findCollectionWrapper,
	getCollection,
	updateCollectionWrapper
} from "@/utils/db/db";
import { sendNotification } from "@/utils/notification/notification_server";
import { getSession } from "@/utils/session/session";
import { JWTPayload } from "jose";
import { ObjectId } from "mongodb";
import { Collection } from "mongodb";
import { NextRequest, NextResponse } from "next/server";
import { timeMachine } from "../timeMachine/timeMachine";

export { generateObjectResponse, generateMessageResponse, stringsToObjectId };

// =============================================================
// ===================== Validatori ============================
// =============================================================
// Descrizione: Questa sezione contiene i validatori che vengono utilizzati per verificare la correttezza dei dati.

export function isEmailValid(email: string): boolean {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
}

export function isISO8601(dateString: string) {
	const iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/;
	return (
		iso8601Regex.test(dateString) && !isNaN(new Date(dateString).getTime())
	);
}

export function areIdFieldsValid(object: Record<string, any>): boolean {
	// Prendiamo le chiavi dell'oggetto da validare
	const keys = Object.keys(object);

	// Iteriamo su tutti campi dell'oggetto e controlliamo se sono presenti dei campi
	// che dovrebbero essere ObjectId in formato stringa.
	// In base al tipo di campo, controlliamo che sia valido.
	for (const key of keys) {
		if (IdFields.includes(key) && !ObjectId.isValid(object[key])) {
			return false;
		}
		if (IdOrNullFields.includes(key)) {
			if (object[key] !== null && !ObjectId.isValid(object[key])) {
				return false;
			}
		}
		if (IdArrayFields.includes(key)) {
			if (!Array.isArray(object[key])) {
				return false;
			}
			for (const id of object[key]) {
				if (!ObjectId.isValid(id)) {
					return false;
				}
			}
		}
	}

	return true;
}

export function isTemplateValid(toValidate: any, template: any): boolean {
	// Prendiamo le chiavi di toValidate e template
	const keys1 = Object.keys(toValidate).sort();
	const keys2 = Object.keys(template).sort();

	// Se hanno un numero di chiavi diverso non sono uguali
	if (keys1.length !== keys2.length) {
		return false;
	}

	// Verifichiamo per ogni chiave se corrispondono
	for (let i = 0; i < keys1.length; i++) {
		if (keys1[i] !== keys2[i]) {
			// Se i nomi delle chiavi sono diversi, non sono uguali
			return false;
		}
		if (typeof toValidate[keys1[i]] !== typeof template[keys2[i]]) {
			// Se il tipo dei valori è diverso
			if (IdOrNullFields.includes(keys1[i])) {
				// Se è un campo che può essere ObjectId o null
				// ed è effettivamente null, allora sono uguali
				if (toValidate[keys1[i]] !== null) {
					return false;
				}
			} else {
				// Se non è un campo che può essere ObjectId o null
				// allora non sono uguali
				return false;
			}
		}
	}

	return true;
}

export function isTemplateSubset(
	toValidate: any,
	template: any,
	requiredField: string[]
): boolean {
	// Prendiamo le chiavi di toValidate e template
	const keys1 = Object.keys(toValidate).sort();
	const keys2 = Object.keys(template).sort();

	// Controlliamo che ci siano i campi obbligatori
	if (!requiredField.every((field) => keys1.includes(field))) {
		return false;
	}

	// Verifichiamo per ogni chiave se corrispondono
	for (let i = 0; i < keys1.length; i++) {
		if (!keys2.includes(keys1[i])) {
			// Se la chiave non è presente nel template
			return false;
		}
		if (typeof toValidate[keys1[i]] !== typeof template[keys2[i]]) {
			// Se il tipo dei valori è diverso
			if (IdOrNullFields.includes(keys1[i])) {
				// Se è un campo che può essere ObjectId o null
				// ed è effettivamente null, allora sono uguali
				if (toValidate[keys1[i]] !== null) {
					return false;
				}
			} else {
				// Se non è un campo che può essere ObjectId o null
				// allora non sono uguali
				return false;
			}
		}
	}

	return true;
}

export async function validate<T>(
	request: NextRequest,
	requestTemplate: Object,
	onlySubset: boolean,
	subsetFields: string[] = []
): Promise<{
	user: { _id: string; username: string; password: string };
	body: T;
} | null> {
	// Prendiamo i cookie della richiesta
	const cookies: JWTPayload | null = await getSession(request.cookies);

	if (cookies === null) {
		// Se non c'è la sessione (Non dovrebbe mai succedere visto che il middleware dovrebbe bloccare la richiesta)
		return null;
	}

	let user: { _id: string; username: string; password: string } =
		cookies.user as any;

	// Convertiamo in JSON il body della richiesta
	const body: any | undefined = await parseJSONInput(request);
	if (body === undefined) {
		return null;
	}

	const newBody = nullSanitizer(body, requestTemplate);

	// Controlliamo che il body abbia tutti i campi necessari
	if (onlySubset) {
		// Se è necessario solo un sottoinsieme del template
		if (!isTemplateSubset(newBody, requestTemplate, subsetFields)) {
			return null;
		}
	} else {
		// Se è necessario tutto il template
		if (!isTemplateValid(newBody, requestTemplate)) {
			return null;
		}
	}

	// Controlliamo che i campi ObjectId siano validi
	if (!areIdFieldsValid(newBody)) {
		return null;
	}

	// TODO: Controllare che le date siano ISO8601 e che se sono presenti
	// dtStart e dtEnd/due, dtStart sia minore di dtEnd/due

	return { user: user, body: newBody };
}

// =============================================================
// ===================== Convertitori ==========================
// =============================================================
// Descrizione: Questa sezione contiene i convertitori che vengono utilizzati per convertire i dati da un formato all'altro.

export async function parseJSONInput(
	request: Request
): Promise<any | undefined> {
	// if is a GET request
	if (request.method === "GET") {
		return {};
	}
	try {
		return await request.json();
	} catch (e) {
		return undefined;
	}
}

export function fromModelToStringModel<T, P>(model: T): P {
	return JSON.parse(JSON.stringify(model)) as P;
}

export function removeArrayDuplicates<T>(array: T[]) {
	const set = new Set(array);
	return Array.from(set);
}

export function getArrayIntersection(array1: [], array2: []) {
	return array1.filter((value) => array2.includes(value));
}

export async function usernameListToIds(
	usernameList: string[],
	sender: string,
	toAddSender: boolean = true
): Promise<NextResponse> {
	// Iteriamo su usernameList per convertire ogni username in un ObjectId in formato stringa
	const userIds: string[] = [];
	const usersError: string[] = [];

	const client: Collection<User> = await getCollection<User>(USER_COLLECTION);

	usernameList = removeArrayDuplicates(usernameList);

	for (const username of usernameList) {
		// Controlliamo che l'utente esista
		const out = await findCollectionWrapper({ username: username }, client);

		if (out.status === 500) {
			return out;
		} else if (out.status === 404) {
			usersError.push(username);
		} else {
			userIds.push((await out.json())[0]._id);
		}
	}

	// Ritorniamo la lista di username errati
	if (usersError.length !== 0) {
		return generateObjectResponse({ users: usersError }, 400);
	}

	if (toAddSender) {
		const index = userIds.indexOf(sender);
		if (index !== -1) {
			userIds.splice(index, 1);
		}
		userIds.unshift(sender);
	}

	return generateObjectResponse({ users: userIds }, 200);
}

export function nullSanitizer(toValidate: any, template: any) {
	let convertedToValidate = { ...toValidate };
	const keys = Object.keys(toValidate);

	for (const key of keys) {
		if (
			Array.isArray(template[key]) &&
			template[key].length === 0 &&
			convertedToValidate[key] === null
		) {
			// Se nel template è un array vuoto e il valore è null, allora è valido
			convertedToValidate[key] = template[key];
		}
	}

	return convertedToValidate;
}

// =============================================================
// ===================== Generatori ============================
// =============================================================
// Descrizione: Questa sezione contiene i generatori che vengono utilizzati per generare oggetti.

type names =
	| "Activity"
	| "Alarm"
	| "Chat"
	| "Event"
	| "GroupChat"
	| "Invitation"
	| "Message"
	| "Note"
	| "Phase"
	| "DayInstance"
	| "PomodoroSettings"
	| "Project"
	| "ProjectActivity"
	| "Session"
	| "User";

// prettier-ignore
const functionsMap = {
	"Activity": createActivity,
	"Alarm": createAlarm,
	"Chat": createChat,
	"Event": createEvent,
	"GroupChat": createGroupChat,
	"Invitation": createInvitation,
	"Message": createMessage,
	"Note": createNote,
	"Phase": createPhase,
	"DayInstance": createDayInstance,
	"PomodoroSettings": createPomodoroSettings,
	"Project": createProject,
	"ProjectActivity": createProjectActivity,
	"Session": createSession,
	"User": createUser
};

export function generateStringModel<T>(obj: Object, type: names): T {
	const objWithId = stringsToObjectId(obj);
	const createFunction = functionsMap[type];
	const generatedModel = createFunction(objWithId);
	return fromModelToStringModel(generatedModel);
}

export async function detachProjectActivity(
	projectActivity: StringProjectActivity,
	projectActivityClient: Collection<ProjectActivity>
): Promise<NextResponse> {
	// Otteniamo l'id dell'attività
	const activityId = projectActivity._id;

	// Rimuoviamo l'attività dai nextIdList delle attività precedenti
	const prevIdList = projectActivity.prevIdList;
	for (const prevId of prevIdList) {
		const prevActivityOut = await findCollectionWrapper<ProjectActivity>(
			{ _id: prevId },
			projectActivityClient
		);

		if (prevActivityOut.status !== 200) {
			return prevActivityOut;
		}

		const prevActivity: StringProjectActivity[] =
			await prevActivityOut.json();

		const prevNextIdList = prevActivity[0].nextIdList.filter(
			(prevNextId) => prevNextId !== activityId
		);

		const updateOut = await updateCollectionWrapper<ProjectActivity>(
			{ _id: prevId },
			{ $set: { nextIdList: prevNextIdList } } as any,
			projectActivityClient
		);

		if (updateOut.status !== 200) {
			return updateOut;
		}
	}

	const nextIdList = projectActivity.nextIdList;

	// Rimuoviamo l'attività dai prevIdList delle attività successive
	for (const nextId of nextIdList) {
		const nextActivityOut = await findCollectionWrapper<ProjectActivity>(
			{ _id: nextId },
			projectActivityClient
		);

		if (nextActivityOut.status !== 200) {
			return nextActivityOut;
		}

		const nextActivity: StringProjectActivity[] =
			await nextActivityOut.json();

		const nextPrevIdList = nextActivity[0].prevIdList.filter(
			(nextPrevId) => nextPrevId !== activityId
		);

		if (nextActivity[0].status === "WAITING") {
			// Controlliamo se le attività successive hanno tutti i prevIdList a COMPLETED
			let allCompleted = true;

			for (const nextPrevId of nextPrevIdList) {
				const nextPrevActivityOut =
					await findCollectionWrapper<ProjectActivity>(
						{ _id: nextPrevId },
						projectActivityClient
					);

				if (nextPrevActivityOut.status !== 200) {
					return nextPrevActivityOut;
				}

				const nextPrevActivity: StringProjectActivity[] =
					await nextPrevActivityOut.json();

				if (nextPrevActivity[0].status !== "COMPLETED") {
					allCompleted = false;
					break;
				}
			}

			if (allCompleted) {
				// Se tutte le attività precedenti sono completate, settiamo lo stato a ACTIVABLE
				const nextActivityOut =
					await updateCollectionWrapper<ProjectActivity>(
						{ _id: nextId },
						{ $set: { status: "ACTIVABLE" } } as any,
						projectActivityClient
					);

				if (nextActivityOut.status !== 200) {
					return nextActivityOut;
				}
			}
		}

		// Rimuoviamo l'attività dai prevIdList delle attività successive
		const updateOut = await updateCollectionWrapper<ProjectActivity>(
			{ _id: nextId },
			{ $pull: { prevIdList: activityId } } as any,
			projectActivityClient
		);

		if (updateOut.status !== 200) {
			return updateOut;
		}
	}

	// Rimuoviamo prevIdList e nextIdList dall'attività
	const updateOut = await updateCollectionWrapper<ProjectActivity>(
		{ _id: activityId },
		{
			$set: {
				prevIdList: [],
				nextIdList: []
			}
		} as any,
		projectActivityClient
	);
	return updateOut;
}

export async function deleteProjectActivity(
	projectActivity: StringProjectActivity,
	projectActivityClient: Collection<ProjectActivity>,
	noteClient: Collection<Note>
): Promise<Response> {
	// Otteniamo l'id dell'attività
	const activityId = projectActivity._id;

	const noteOut = await deleteCollectionWrapper<Note>(
		{ _id: projectActivity.noteId },
		noteClient
	);

	const detachedOut = await detachProjectActivity(
		projectActivity,
		projectActivityClient
	);

	if (detachedOut.status !== 200) {
		return detachedOut;
	}

	if (noteOut.status !== 200) {
		return noteOut;
	}

	// Eliminiamo l'attività
	return await deleteCollectionWrapper<ProjectActivity>(
		{ _id: activityId },
		projectActivityClient
	);
}

export async function deletePhase(
	phase: StringPhase,
	phaseClient: Collection<Phase>,
	activityClient: Collection<ProjectActivity>,
	noteClient: Collection<Note>
): Promise<Response> {
	const phaseId = phase._id;
	// Otteniamo le sottofasi
	const subPhasesOut = await findCollectionWrapper<Phase>(
		{ parentId: phaseId },
		phaseClient
	);

	// Se ci sono sottofasi, le cancelliamo
	if (subPhasesOut.status === 200) {
		const subPhases: StringPhase[] = await subPhasesOut.json();
		// Eliminiamo le sottofasi
		while (subPhases.length > 0) {
			const subPhase = subPhases.shift()!;
			const subPhaseOut = await deletePhase(
				subPhase,
				phaseClient,
				activityClient,
				noteClient
			);
			if (subPhaseOut.status !== 200) {
				return subPhaseOut;
			}
		}
	} else if (subPhasesOut.status === 404) {
		// Otteniamo le attività associate alla fase
		const activitiesOut = await findCollectionWrapper<ProjectActivity>(
			{ phaseId: phaseId },
			activityClient
		);

		if (activitiesOut.status === 200) {
			const activities: StringProjectActivity[] =
				await activitiesOut.json();

			// Eliminiamo le attività associate alla fase
			for (const activity of activities) {
				const activityOut = await deleteProjectActivity(
					activity,
					activityClient,
					noteClient
				);

				if (activityOut.status !== 200) {
					return activityOut;
				}
			}
		} else if (activitiesOut.status !== 404) {
			return activitiesOut;
		}
	} else if (subPhasesOut.status === 500) {
		return subPhasesOut;
	}

	// Eliminiamo la fase
	return await deleteCollectionWrapper<Phase>({ _id: phaseId }, phaseClient);
}

// Funzione per convertire una lista di id di utenti in una lista di nomi utente
export async function idListToNameList(
	idList: string[]
): Promise<{ status: number; userNameList?: string[]; error?: string }> {
	// Inizializza la lista dei nomi utente come vuota
	const userNameList: string[] = [];

	try {
		// Recupera il client della collezione utenti
		const userClient: Collection<User> =
			await getCollection<User>(USER_COLLECTION);

		// Itera sugli ID per trovare gli utenti corrispondenti
		for (const userId of idList) {
			const outUser = await findCollectionWrapper<User>(
				{ _id: userId } as any,
				userClient
			);

			if (outUser.status !== 200) {
				// Se c'è stato un errore, ritorna un errore con lo stato corrispondente
				return {
					status: outUser.status,
					error: `Errore nel recupero dell'utente con ID ${userId}`
				};
			} else {
				const user = await outUser.json();
				// Aggiungi lo username alla lista (assumendo che ci sia almeno un risultato)
				if (user.length > 0) {
					userNameList.push(user[0].username);
				} else {
					return {
						status: 404,
						error: `Nessun utente trovato con ID ${userId}`
					};
				}
			}
		}

		// Ritorna la lista di nomi utente con lo stato 200
		return { status: 200, userNameList };
	} catch (error: any) {
		// Gestione generale degli errori
		return {
			status: 500,
			error: `Errore interno del server: ${error.message}`
		};
	}
}

// Funzione per ottenere un nome utente da un ID
export async function getNameFromId(userId: string): Promise<string> {
	// Recupera il client della collezione utenti
	const userClient: Collection<User> =
		await getCollection<User>(USER_COLLECTION);

	// Cerca l'utente con l'ID specificato
	const outUser = await findCollectionWrapper<User>(
		{ _id: userId } as any,
		userClient
	);

	if (outUser.status !== 200) {
		// Se c'è stato un errore, ritorna un errore con lo stato corrispondente
		throw new Error(`Errore nel recupero dell'utente con ID ${userId}`);
	} else {
		const user = await outUser.json();
		// Ritorna il nome dell'utente
		return user[0].username;
	}
}

// Funzione per invitare una lista di utenti ad un particolare evento (target in generale)
export async function addInvitations(
	userIdList: string[],
	type: "ACTIVITY" | "EVENT" | "SESSION" | "PROJECT" | "NOTE",
	targetId: string
) {
	// Otteniamo la collezione delle invitation
	const invitationClient: Collection<Invitation> =
		await getCollection<Invitation>(INVITATION_COLLECTION);

	// Per ogni utente nella lista, creiamo un invito
	for (const userId of userIdList) {
		const newInvitation = generateStringModel<StringInvitation>(
			{ userId: userId, type: type, targetId: targetId },
			"Invitation"
		);

		// Aggiungiamo l'invito alla collezione
		const out = await addCollectionWrapper(newInvitation, invitationClient);

		if (out.status !== 200) {
			return out;
		}

		// Inviamo la notifica all'utente
		const notificationData = {
			title: "Nuova notifica",
			body: "Hai ricevuto un invito, premi per visualizzarlo",
			image: "",
			icon: "",
			url: "/inbox"
		};

		// Inviamo la notifica (Non gestiamo il caso di fallimento)
		await sendNotification(userId, notificationData);
	}

	return generateMessageResponse("Invitations sent", 200);
}

// Funzione per rimuovere gli inviti relativi ad un particolare evento (target in generale)
export async function removeInvitations(
	type: "ACTIVITY" | "EVENT" | "SESSION" | "PROJECT" | "NOTE",
	targetId: string
) {
	// Otteniamo la collezione delle invitation
	const invitationClient: Collection<Invitation> =
		await getCollection<Invitation>(INVITATION_COLLECTION);

	// Rimuoviamo gli inviti relativi all'evento
	const out = await deleteCollectionWrapper<Invitation>(
		{ type: type, targetId: targetId },
		invitationClient
	);

	if (out.status === 500) {
		return generateMessageResponse("Internal error", 500);
	}

	return generateMessageResponse("Invitations removed", 200);
}

async function checkAndUpdatePhase(
	phaseId: string,
	newDue: Date,
	phaseClient: Collection<Phase>
): Promise<NextResponse> {
	// Prendiamo la fase padre
	const parentPhaseOut = await findCollectionWrapper<Phase>(
		{ _id: phaseId },
		phaseClient
	);

	if (parentPhaseOut.status !== 200) {
		return parentPhaseOut;
	}

	const phase: StringPhase = (await parentPhaseOut.json())[0];

	// Controlliamo se la fase contiene la sottofase
	if (new Date(phase.due) < newDue) {
		// Se la fase padre ha una data di scadenza maggiore della sottophase, aggiorniamo la data di scadenza della fase padre
		await updateCollectionWrapper<Phase>(
			{ _id: phase._id },
			{ $set: { due: newDue.toISOString() } } as any,
			phaseClient
		);

		// Controlliamo se la fase padre è una sottofase
		if (phase.parentId !== phase.projectId) {
			return checkAndUpdatePhase(phase.parentId, newDue, phaseClient);
		}
	}

	return generateMessageResponse("Phase updated", 200);
}

export async function dropProjectActivity(
	activity: StringProjectActivity,
	client: Collection<ProjectActivity>
): Promise<NextResponse> {
	const detachedOut = await detachProjectActivity(activity, client);

	if (detachedOut.status !== 200) {
		return detachedOut;
	}

	const updateOut = await updateCollectionWrapper<ProjectActivity>(
		{ _id: activity._id },
		{ $set: { status: "DROPPED" } } as any,
		client
	);

	return updateOut;
}

async function updateNextActivitiesDates(
	activity: StringProjectActivity,
	today: Date,
	projectActivityClient: Collection<ProjectActivity>,
	phaseClient: Collection<Phase>
): Promise<NextResponse> {
	// La scolleghiamo dalle attività precedenti e successive e la impostiamo a dropped
	if (activity.isMilestone) {
		const dropProjectActivityOut = await dropProjectActivity(
			activity,
			projectActivityClient
		);

		if (dropProjectActivityOut.status !== 200) {
			return dropProjectActivityOut;
		}
	} else {
		// Controlliamo le attività successive
		for (const nextActivityId of activity.nextIdList) {
			const nextActivityOut =
				await findCollectionWrapper<ProjectActivity>(
					{ _id: nextActivityId },
					projectActivityClient
				);
			if (nextActivityOut.status !== 200) {
				return nextActivityOut;
			}

			const nextActivity: StringProjectActivity = (
				await nextActivityOut.json()
			)[0];
			// Se doveva iniziare oggi la spostiamo a domani
			const tomorrow = new Date(today);
			tomorrow.setDate(tomorrow.getDate() + 1);
			if (
				nextActivity.isMilestone &&
				new Date(nextActivity.dtStart) <= today
			) {
				// Se doveva ANCHE finire oggi la droppiamo
				if (new Date(nextActivity.due) <= tomorrow) {
					const dropProjectActivityOut = await dropProjectActivity(
						nextActivity,
						projectActivityClient
					);

					if (dropProjectActivityOut.status !== 200) {
						return dropProjectActivityOut;
					}
				} else {
					// Altrimenti spostiamo solo l'inizio a domani
					const updateOut =
						await updateCollectionWrapper<ProjectActivity>(
							{ _id: nextActivity._id },
							{
								$set: {
									dtStart: tomorrow.toISOString()
								}
							} as any,
							projectActivityClient
						);
					if (updateOut.status !== 200) {
						return updateOut;
					}
					// Aggiorniamo le fasi in cui é contenuta nel caso
					const checkOut = await checkAndUpdatePhase(
						nextActivity.phaseId,
						tomorrow,
						phaseClient
					);

					if (checkOut.status !== 200) {
						return checkOut;
					}
				}
			} else {
				if (new Date(nextActivity.dtStart) <= today) {
					// Aumentiamo il due per mantenere il range
					const newDue = new Date(nextActivity.due);
					newDue.setDate(newDue.getDate() + 1);

					// Aggiorniamo il dtStart e il due
					const updateOut =
						await updateCollectionWrapper<ProjectActivity>(
							{ _id: nextActivity._id },
							{
								$set: {
									dtStart: tomorrow.toISOString(),
									due: newDue.toISOString()
								}
							} as any,
							projectActivityClient
						);
					if (updateOut.status !== 200) {
						return updateOut;
					}
					// Aggiorniamo le fasi in cui é contenuta nel caso
					const checkOut = await checkAndUpdatePhase(
						nextActivity.phaseId,
						newDue,
						phaseClient
					);

					if (checkOut.status !== 200) {
						return checkOut;
					}

					// Modifichiamo il due per essere l'inizio del giorno
					newDue.setHours(2, 0, 0, 0);

					// Spostando il due richiamiamo la funzione per controllare se le attività successive sono tutte completate
					const nextUpdateOut = await updateNextActivitiesDates(
						nextActivity,
						newDue,
						projectActivityClient,
						phaseClient
					);

					if (nextUpdateOut.status !== 200) {
						return nextUpdateOut;
					}
				}
			}
		}
	}
	return generateMessageResponse("Next activities dates updated", 200);
}

export async function handleOverdues() {
	// Otteniamo la collezione delle project activities
	const projectActivityClient: Collection<ProjectActivity> =
		await getCollection<ProjectActivity>(PROJECT_ACTIVITY_COLLECTION);

	// Otteniamo la collezione delle fasi
	const phaseClient: Collection<Phase> =
		await getCollection<Phase>(PHASE_COLLECTION);

	// Prendiamo tutte le project activities
	const allActivitiesOut = await findCollectionWrapper<ProjectActivity>(
		{},
		projectActivityClient
	);

	if (allActivitiesOut.status !== 200) {
		return allActivitiesOut;
	}

	const allActivities: StringProjectActivity[] =
		await allActivitiesOut.json();

	const today = timeMachine.timeMachineTime;
	// Prendiamo il timestamp di oggi a mezzanotte
	// Creare nuovo valore perché é per riferimento
	console.log("today ", today.toISOString());
	today.setHours(2, 0, 0, 0);
	console.log("today ", today.toISOString());
	today.setDate(today.getDate() + 1);
	console.log("tomorrow ", today.toISOString());

	// Filtriamo le attività scadute
	const overdueActivities = allActivities.filter((activity) => {
		return (
			new Date(activity.due) <= today &&
			activity.status !== "COMPLETED" &&
			activity.status !== "DROPPED"
		);
	});

	for (const activity of overdueActivities) {
		// Se non é una milestone dobbiamo aggiornare solo il due, dentro ad updateNextActivitiesDates
		// modificheremo anche il dtStart
		if (!activity.isMilestone) {
			const newDue = new Date(activity.due);
			newDue.setDate(newDue.getDate() + 1);
			const updateOut = await updateCollectionWrapper<ProjectActivity>(
				{ _id: activity._id },
				{
					$set: {
						due: today.toISOString()
					}
				} as any,
				projectActivityClient
			);
			if (updateOut.status !== 200) {
				return updateOut;
			}
			// Aggiorniamo le fasi in cui é contenuta nel caso
			const checkOut = await checkAndUpdatePhase(
				activity.phaseId,
				newDue,
				phaseClient
			);

			if (checkOut.status !== 200) {
				return checkOut;
			}
		}

		const updateNextActivitiesDatesOut = await updateNextActivitiesDates(
			activity,
			today,
			projectActivityClient,
			phaseClient
		);

		if (updateNextActivitiesDatesOut.status !== 200) {
			return updateNextActivitiesDatesOut;
		}

		// Se l´attivitá non é giá in overdue la impostiamo a overdue
		if (!activity.isOverdue && !activity.isMilestone) {
			const updateOut = await updateCollectionWrapper<ProjectActivity>(
				{ _id: activity._id },
				{ $set: { isOverdue: true } } as any,
				projectActivityClient
			);

			if (updateOut.status !== 200) {
				return updateOut;
			}
		}
	}

	return generateMessageResponse("Overdue activities updated", 200);
}
