import {
	generateMessageResponse,
	generateObjectResponse,
	validate
} from "@/utils/api/api";
import { getNameFromId } from "@/utils/api/api";
import {
	CHAT_COLLECTION,
	Chat,
	GROUP_CHAT_COLLECTION,
	GroupChat,
	NOTE_COLLECTION,
	Note,
	PROJECT_COLLECTION,
	Project,
	USER_COLLECTION,
	User,
	findCollectionWrapper,
	getCollection
} from "@/utils/db/db";
import { Collection } from "mongodb";
import { NextRequest } from "next/server";

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

interface PreviewsResponse {
	notes: ReducedNote[];
	projects: ReducedProject[];
	chats: ReducedChat[];
}

// TODO: eventi, pomodoro

export const GET = async (request: NextRequest) => {
	// Validazione della richiesta
	const validation = await validate<{}>(request, {}, false);

	// Se la validazione fallisce, ritorna il messaggio di errore
	if (validation === null) {
		return generateMessageResponse("Invalid request", 400);
	}

	const { user, body: newBody } = validation;

	// Prendi tutte le note in cui compare l'utente e crea una lista di ReducedNote
	const noteClient: Collection<Note> =
		await getCollection<Note>(NOTE_COLLECTION);

	const noteOut = await findCollectionWrapper<Note>(
		{ userIdList: { $in: [user._id] } } as any,
		noteClient
	);

	if (noteOut.status !== 200) {
		return noteOut;
	}

	if (!noteOut.body) {
		return generateMessageResponse("No data found", 404);
	}

	const notes = await noteOut.json();

	const reducedNotes: ReducedNote[] = notes.map((note: any) => ({
		_id: note._id,
		summary: note.summary,
		categories: note.categories,
		dtModified: note.dtModified
	}));

	// Prendi tutti i progetti in cui compare l'utente e crea una lista di ReducedProject
	const projectClient: Collection<Project> =
		await getCollection<Project>(PROJECT_COLLECTION);

	const projectOut = await findCollectionWrapper<Project>(
		{ userIdList: { $in: [user._id] } } as any,
		projectClient
	);

	if (projectOut.status !== 200) {
		return projectOut;
	}

	if (!projectOut.body) {
		return generateMessageResponse("No data found", 404);
	}

	const projects = await projectOut.json();

	const reducedProjects: ReducedProject[] = projects.map((project: any) => ({
		_id: project._id,
		summary: project.summary,
		noteId: project.noteId
	}));

	// Prendi tutte le chat in cui compare l'utente e crea una lista di ReducedChat
	const chatClient: Collection<Chat> =
		await getCollection<Chat>(CHAT_COLLECTION);

	const chatOut = await findCollectionWrapper<Chat>(
		{ userIdList: { $in: [user._id] } } as any,
		chatClient
	);

	if (chatOut.status !== 200) {
		return chatOut;
	}

	if (!chatOut.body) {
		return generateMessageResponse("No data found", 404);
	}

	const chats = await chatOut.json();
	let reducedChats: ReducedChat[] = [];

	for (const chat of chats) {
		const currentUserIndex = chat.userIdList.indexOf(user._id!);
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
			const lastMessageAt = new Date(chat.lastMessageAt).toISOString();
			const lastMessage = chat.messages[chat.messages.length - 1].content;

			reducedChats.push({
				_id: chat._id,
				summary: summary,
				lastMessage: lastMessage,
				lastMessageOwner: lastMessageOwner,
				lastMessageAt: lastMessageAt
			});
		} catch (error) {
			return generateMessageResponse(
				"Error getting project informations",
				400
			);
		}
	}

	// Stessa cosa per le group chat

	const groupChatClient: Collection<GroupChat> =
		await getCollection<GroupChat>(GROUP_CHAT_COLLECTION);

	const groupChatOut = await findCollectionWrapper<GroupChat>(
		{ userIdList: { $in: [user._id] } } as any,
		groupChatClient
	);

	if (groupChatOut.status !== 200) {
		return groupChatOut;
	}

	if (!groupChatOut.body) {
		return generateMessageResponse("No data found", 404);
	}

	const groupChats = await groupChatOut.json();

	for (const groupChat of groupChats) {
		const currentUserIndex = groupChat.userIdList.indexOf(user._id!);

		try {
			const summary = groupChat.summary;
			const lastMessageOwnerId =
				groupChat.messages[groupChat.messages.length - 1].ownerId;
			let lastMessageOwner: string = "Tu";

			if (lastMessageOwnerId !== groupChat.userIdList[currentUserIndex]) {
				lastMessageOwner = await getNameFromId(
					groupChat.userIdList[lastMessageOwnerId]
				);
			}

			const lastMessageAt = new Date(
				groupChat.lastMessageAt
			).toISOString();

			const lastMessage =
				groupChat.messages[groupChat.messages.length - 1].content;

			reducedChats.push({
				_id: groupChat._id,
				summary: summary,
				lastMessage: lastMessage,
				lastMessageOwner: lastMessageOwner,
				lastMessageAt: lastMessageAt
			});
		} catch (error) {
			return generateMessageResponse(
				"Error getting user informations",
				400
			);
		}
	}

	const PreviewsResponse: PreviewsResponse = {
		notes: reducedNotes,
		projects: reducedProjects,
		chats: reducedChats
	};

	return generateObjectResponse(PreviewsResponse, 200);
};
