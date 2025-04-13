import {
	generateMessageResponse,
	generateObjectResponse,
	validate
} from "@/utils/api/api";
import { getNameFromId } from "@/utils/api/api";
import {
	// Collezioni per il calendario:
	ACTIVITY_COLLECTION,
	Activity,
	CHAT_COLLECTION,
	Chat,
	EVENT_COLLECTION,
	Event,
	GROUP_CHAT_COLLECTION,
	GroupChat,
	NOTE_COLLECTION,
	Note,
	PROJECT_ACTIVITY_COLLECTION,
	PROJECT_COLLECTION,
	Project,
	ProjectActivity,
	SESSION_COLLECTION,
	Session,
	StringEvent,
	StringSession,
	USER_COLLECTION,
	User,
	findCollectionWrapper,
	getCollection
} from "@/utils/db/db";
import { timeMachine } from "@/utils/timeMachine/timeMachine";
import { Collection } from "mongodb";
import { NextRequest } from "next/server";
import { rrulestr } from "rrule";

//
// Tipi per le preview “ridotte” esistenti
//
interface ReducedNote {
	_id: string;
	summary: string;
	categories: string;
	dtModified: string;
}

interface ReducedProject {
	_id: string;
	summary: string;
	noteId: string;
}

interface ReducedChat {
	_id: string;
	summary: string;
	lastMessage: string;
	lastMessageOwner: string;
	lastMessageAt: string;
}

//
// Nuovi tipi per la preview del calendario
//
interface ReducedActivity {
	_id: string;
	summary: string;
	description: string;
	data: string; // in formato ISO
	ownerName: string;
}

interface ReducedProjectActivity {
	_id: string;
	summary: string;
	description: string;
	data: string; // in formato ISO
	ownerName: string;
}

interface ReducedEvent {
	_id: string;
	summary: string;
	description: string;
	data: string; // occorrenza (se ricorrente) oppure dtStart
	ownerName: string;
}

interface ReducedSession {
	_id: string;
	summary: string;
	description: string;
	data: string; // occorrenza calcolata dalla rrule
	ownerName: string;
}

interface ReducedCalendar {
	activities: ReducedActivity[];
	projectActivities: ReducedProjectActivity[];
	events: ReducedEvent[];
	sessions: ReducedSession[];
}

type OccurrenceType = "event" | "activity" | "session" | "projectActivity";
interface Occurrence {
	type: OccurrenceType;
	occurrenceDate: Date;
	_id: string;
	summary: string;
	description: string;
	ownerName: string;
}

//
// Risposta finale che ora include anche il ReducedCalendar
//
interface PreviewsResponse {
	notes: ReducedNote[];
	projects: ReducedProject[];
	chats: ReducedChat[];
	calendar: ReducedCalendar;
}

async function generateRecurringCalendarEvents(
	originalEvent: StringEvent | StringSession,
	eventType: "event" | "session",
	currentDate: Date
): Promise<Occurrence[]> {
	const calendarEvents: Occurrence[] = [];
	const start = new Date(originalEvent.dtStart);
	const rrule = originalEvent.rrule;

	// Vogliamo generare tutti gli eventi ricorrenti in un range che va
	// dal primo del mese corrente all'ultimo del mese successivo

	// Primo giorno del mese precedente
	const firstDayPrevMonth = new Date(
		currentDate.getFullYear(),
		currentDate.getMonth() - 1,
		1
	);

	// Ultimo giorno del mese successivo
	const lastDayNextMonth = new Date(
		currentDate.getFullYear(),
		currentDate.getMonth() + 2,
		0
	);

	const rule = rrulestr(rrule, { dtstart: new Date(start) });

	const occurrences = rule.between(firstDayPrevMonth, lastDayNextMonth);

	// Per l'evento, prendo l'ownerName
	const ownerName: string = await getNameFromId(
		originalEvent.ownerId.toString()
	);

	occurrences.forEach((date) => {
		const newEvent: Occurrence = {
			type: eventType,
			occurrenceDate: date,
			_id: originalEvent._id!,
			summary: originalEvent.summary,
			description: originalEvent.description,
			ownerName
		};
		calendarEvents.push(newEvent);
	});

	return calendarEvents;
}

//
// Endpoint GET aggiornato
//
export const GET = async (request: NextRequest) => {
	// Validazione della richiesta
	const validation = await validate<{}>(request, {}, false);

	// Se la validazione fallisce, ritorna il messaggio di errore
	if (validation === null) {
		return generateMessageResponse("Invalid request", 400);
	}

	const { user } = validation;

	// Prendo l'utente dal db
	const userClient: Collection<User> =
		await getCollection<User>(USER_COLLECTION);
	const userOut = await findCollectionWrapper<User>(
		{ _id: user._id } as any,
		userClient
	);
	if (userOut.status !== 200 && userOut.status !== 404) {
		return userOut;
	}
	if (!userOut.body) {
		return generateMessageResponse("No data found", 404);
	}

	const previews = (await userOut.json())[0].previews;

	// ======================
	// Preview delle NOTE
	// ======================
	const noteClient: Collection<Note> =
		await getCollection<Note>(NOTE_COLLECTION);
	const noteOut = await findCollectionWrapper<Note>(
		{ userIdList: { $in: [user._id] } } as any,
		noteClient
	);
	if (noteOut.status !== 200 && noteOut.status !== 404) {
		return noteOut;
	}
	if (!noteOut.body) {
		return generateMessageResponse("No data found", 404);
	}
	const notes = await noteOut.json();
	// Ordina le note dalla più recente alla più vecchia
	let reducedNotes: ReducedNote[] = [];
	if (notes.length > 0) {
		const sortedNotes = notes.sort(
			(a: Note, b: Note) =>
				new Date(b.dtModified).getTime() -
				new Date(a.dtModified).getTime()
		);

		// Applica il limite delle preview
		const limitedNotes = sortedNotes.slice(0, previews.maxNotes);

		// Mappa alla struttura ReducedNote
		reducedNotes = limitedNotes.map((note: Note) => ({
			_id: note._id,
			summary: note.summary,
			categories: note.categories,
			dtModified: note.dtModified
		}));
	}

	// ======================
	// Preview dei PROGETTI
	// ======================
	const projectClient: Collection<Project> =
		await getCollection<Project>(PROJECT_COLLECTION);
	const projectOut = await findCollectionWrapper<Project>(
		{ userIdList: { $in: [user._id] } } as any,
		projectClient
	);
	if (projectOut.status !== 200 && projectOut.status !== 404) {
		return projectOut;
	}
	if (!projectOut.body) {
		return generateMessageResponse("No data found", 404);
	}
	const projects = await projectOut.json();
	let reducedProjects: ReducedProject[] = [];
	if (projects.length > 0) {
		reducedProjects = projects.map((project: any) => ({
			_id: project._id,
			summary: project.summary,
			noteId: project.noteId
		}));
	}

	// ======================
	// Preview delle CHAT (privata e di gruppo)
	// ======================
	const chatClient: Collection<Chat> =
		await getCollection<Chat>(CHAT_COLLECTION);
	const chatOut = await findCollectionWrapper<Chat>(
		{ userIdList: { $in: [user._id] } } as any,
		chatClient
	);
	if (chatOut.status !== 200 && chatOut.status !== 404) {
		return chatOut;
	}
	if (!chatOut.body) {
		return generateMessageResponse("No data found", 404);
	}
	const chatsData = await chatOut.json();
	let reducedChats: ReducedChat[] = [];

	if (chatsData.length > 0) {
		for (const chat of chatsData) {
			const currentUserIndex = chat.userIdList.indexOf(user._id);
			const otherUserIndex = 1 - currentUserIndex;

			try {
				const otherUser: string = await getNameFromId(
					chat.userIdList[otherUserIndex]
				);
				const summary = "Chat con " + otherUser;
				const lastMessageOwnerId =
					chat.messages[chat.messages.length - 1].ownerId;
				let lastMessageOwner: string = "Tu";
				if (lastMessageOwnerId === chat.userIdList[otherUserIndex]) {
					lastMessageOwner = otherUser;
				}
				const lastMessageAt = new Date(
					chat.lastMessageAt
				).toISOString();
				const lastMessage =
					chat.messages[chat.messages.length - 1].content;

				reducedChats.push({
					_id: chat._id,
					summary,
					lastMessage,
					lastMessageOwner,
					lastMessageAt
				});
			} catch (error) {
				return generateMessageResponse(
					"Error getting chat informations",
					400
				);
			}
		}
	}

	// Group chats
	const groupChatClient: Collection<GroupChat> =
		await getCollection<GroupChat>(GROUP_CHAT_COLLECTION);
	const groupChatOut = await findCollectionWrapper<GroupChat>(
		{ userIdList: { $in: [user._id] } } as any,
		groupChatClient
	);
	if (groupChatOut.status !== 200 && groupChatOut.status !== 404) {
		return groupChatOut;
	}
	if (!groupChatOut.body) {
		return generateMessageResponse("No data found", 404);
	}
	const groupChats = await groupChatOut.json();

	if (groupChats.length > 0) {
		for (const groupChat of groupChats) {
			const currentUserIndex = groupChat.userIdList.indexOf(user._id);

			try {
				const summary = groupChat.summary;

				if (groupChat.messages.length === 0) {
					continue; // Se non ci sono messaggi, salta
				}

				const lastMessageOwnerId =
					groupChat.messages[groupChat.messages.length - 1].ownerId;
				let lastMessageOwner: string = "Tu";

				// Se il proprietario dell'ultimo messaggio non è l'utente corrente, lo recupera
				if (lastMessageOwnerId !== user._id) {
					lastMessageOwner = await getNameFromId(lastMessageOwnerId);
				}

				const lastMessageAt = new Date(
					groupChat.lastMessageAt
				).toISOString();
				const lastMessage =
					groupChat.messages[groupChat.messages.length - 1].content;

				reducedChats.push({
					_id: groupChat._id,
					summary,
					lastMessage,
					lastMessageOwner,
					lastMessageAt
				});
			} catch (error) {
				return generateMessageResponse(
					"Error getting group chat informations",
					400
				);
			}
		}
	}

	// Ordina le chat per lastMessageAt dalla più recente alla più vecchia
	reducedChats = reducedChats.sort(
		(a, b) =>
			new Date(b.lastMessageAt).getTime() -
			new Date(a.lastMessageAt).getTime()
	);

	// Riduci il numero di chat a maxChats
	reducedChats = reducedChats.slice(0, previews.maxChats);

	// ======================
	// Preview del CALENDARIO
	// ======================
	// Obiettivo: spedire maxOccurrences occorrenze (eventi, attività, sessioni, projectActivity) ordinate per data.
	// Per:
	// - Eventi: se hanno rrule, estrai le occorrenze (altrimenti usa dtStart)
	// - Attività: usa il campo "due"
	// - Sessioni: usa le occorrenze dalla rrule (che è obbligatoria)
	// - ProjectActivity: usa il campo due
	// Scegli se mettere o no ogni evento (in senso generico) in base alle impostazioni dell'utente
	const now = timeMachine.timeMachineTime;
	const futureLimit = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000); // ad es. 1 anno in avanti

	// Array per raccogliere tutte le occorrenze
	let calendarOccurrences: Occurrence[] = [];

	// --- Attività ---
	if (previews.calendar.activity) {
		const activityClient: Collection<Activity> =
			await getCollection<Activity>(ACTIVITY_COLLECTION);
		const activityOut = await findCollectionWrapper<Activity>(
			{ userIdList: { $in: [user._id] } } as any,
			activityClient
		);
		let activities: Activity[] = [];
		if (activityOut.status === 200 && activityOut.body) {
			activities = await activityOut.json();
		}
		for (const act of activities) {
			try {
				const ownerName = await getNameFromId(act.ownerId.toString());
				const due = new Date(act.due);
				if (due >= now) {
					calendarOccurrences.push({
						type: "activity",
						occurrenceDate: due,
						_id: act._id?.toString()!,
						summary: act.summary,
						description: act.description,
						ownerName
					});
				}
			} catch (e) {
				console.error("Error processing activity", e);
			}
		}
	}

	// --- ProjectActivity ---
	if (previews.calendar.projectActivity) {
		const projectActivityClient: Collection<ProjectActivity> =
			await getCollection<ProjectActivity>(PROJECT_ACTIVITY_COLLECTION);
		const projectActivityOut = await findCollectionWrapper<ProjectActivity>(
			{ userIdList: { $in: [user._id] } } as any,
			projectActivityClient
		);
		let projectActivities: ProjectActivity[] = [];
		if (projectActivityOut.status === 200 && projectActivityOut.body) {
			projectActivities = await projectActivityOut.json();
		}
		for (const pa of projectActivities) {
			try {
				const ownerName = await getNameFromId(pa.ownerId.toString());
				const due = new Date(pa.due);
				if (due >= now) {
					calendarOccurrences.push({
						type: "projectActivity",
						occurrenceDate: due,
						_id: pa._id?.toString()!,
						summary: pa.summary,
						description: pa.description,
						ownerName
					});
				}
			} catch (e) {
				console.error("Error processing project activity", e);
			}
		}
	}

	// --- Eventi ---
	if (previews.calendar.event) {
		const eventClient: Collection<Event> =
			await getCollection<Event>(EVENT_COLLECTION);
		const eventOut = await findCollectionWrapper<Event>(
			{ userIdList: { $in: [user._id] } } as any,
			eventClient
		);
		let events: StringEvent[] = [];
		if (eventOut.status === 200 && eventOut.body) {
			events = await eventOut.json();
		}
		for (const ev of events) {
			try {
				const ownerName = await getNameFromId(ev.ownerId.toString());
				if (ev.rrule && ev.rrule.trim() !== "") {
					// Evento ricorrente: estrai le occorrenze
					const occurrences = await generateRecurringCalendarEvents(
						ev,
						"event",
						now
					);
					calendarOccurrences.push(...occurrences);
				} else {
					// Evento non ricorrente: usa dtStart
					const dtStart = new Date(ev.dtStart);
					if (dtStart >= now) {
						calendarOccurrences.push({
							type: "event",
							occurrenceDate: dtStart,
							_id: ev._id?.toString()!,
							summary: ev.summary,
							description: ev.description,
							ownerName
						});
					}
				}
			} catch (e) {
				console.error("Error processing event", e);
			}
		}
	}

	// --- Sessioni ---
	if (previews.calendar.session) {
		const sessionClient: Collection<Session> =
			await getCollection<Session>(SESSION_COLLECTION);
		const sessionOut = await findCollectionWrapper<Session>(
			{ ownerId: user._id } as any,
			sessionClient
		);
		let sessions: StringSession[] = [];
		if (sessionOut.status === 200 && sessionOut.body) {
			sessions = await sessionOut.json();
		}

		for (const sess of sessions) {
			try {
				const ownerName = await getNameFromId(sess.ownerId.toString());
				// Le sessioni hanno obbligatoria la rrule
				const occurrences = await generateRecurringCalendarEvents(
					sess,
					"session",
					now
				);
				calendarOccurrences.push(...occurrences);
			} catch (e) {
				console.error("Error processing session", e);
			}
		}
	}

	// Ordina tutte le occorrenze per data crescente
	calendarOccurrences.sort(
		(a, b) => a.occurrenceDate.getTime() - b.occurrenceDate.getTime()
	);

	// Prendi le prime 10 occorrenze
	const nextSeven = calendarOccurrences.slice(
		0,
		previews.calendar.maxOccurrences
	);

	// Distribuisci le occorrenze nei rispettivi array in base al tipo
	let reducedProjectsActivities: ReducedProjectActivity[] = [];
	let reducedActivities: ReducedActivity[] = [];
	let reducedEvents: ReducedEvent[] = [];
	let reducedSessions: ReducedSession[] = [];

	nextSeven.forEach((occ) => {
		const reducedItem = {
			_id: occ._id,
			summary: occ.summary,
			description: occ.description,
			data: occ.occurrenceDate.toISOString(),
			ownerName: occ.ownerName
		};
		if (occ.type === "activity") {
			reducedActivities.push(reducedItem as ReducedActivity);
		} else if (occ.type === "projectActivity") {
			reducedProjectsActivities.push(
				reducedItem as ReducedProjectActivity
			);
		} else if (occ.type === "event") {
			reducedEvents.push(reducedItem as ReducedEvent);
		} else if (occ.type === "session") {
			reducedSessions.push(reducedItem as ReducedSession);
		}
	});

	const reducedCalendar: ReducedCalendar = {
		activities: reducedActivities,
		projectActivities: reducedProjectsActivities,
		events: reducedEvents,
		sessions: reducedSessions
	};

	// ======================
	// Costruzione della risposta finale
	// ======================
	const finalResponse: PreviewsResponse = {
		notes: reducedNotes,
		projects: reducedProjects,
		chats: reducedChats,
		calendar: reducedCalendar
	};

	return generateObjectResponse(finalResponse, 200);
};
