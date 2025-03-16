// Importazione del client per la connessione al database
import { clientPromise } from "@/utils/db/db_client";
// Importazione dei modelli
import { Activity, StringActivity } from "@/utils/db/models/Activity";
import { Chat, StringChat } from "@/utils/db/models/Chat";
import { Event, StringEvent } from "@/utils/db/models/Event";
import { GroupChat, StringGroupChat } from "@/utils/db/models/GroupChat";
import { Invitation, StringInvitation } from "@/utils/db/models/Invitation";
import { Note, StringNote } from "@/utils/db/models/Note";
import { Phase, StringPhase } from "@/utils/db/models/Phase";
import { Project, StringProject } from "@/utils/db/models/Project";
import {
	ProjectActivity,
	StringProjectActivity
} from "@/utils/db/models/ProjectActivity";
import { Session, StringSession } from "@/utils/db/models/Session";
import { StringUser, User } from "@/utils/db/models/User";
// Importazione da mongodb
import {
	Collection,
	MongoClient,
	ObjectId,
	OptionalUnlessRequiredId,
	WithId
} from "mongodb";

const DB_NAME = "Selfie";

export const USER_COLLECTION = "users";
export const EVENT_COLLECTION = "events";
export const ACTIVITY_COLLECTION = "activities";
export const CHAT_COLLECTION = "chats";
export const SESSION_COLLECTION = "sessions";
export const GROUP_CHAT_COLLECTION = "groupChats";
export const INVITATION_COLLECTION = "invitations";
export const NOTE_COLLECTION = "notes";
export const PHASE_COLLECTION = "phases";
export const PROJECT_COLLECTION = "projects";
export const PROJECT_ACTIVITY_COLLECTION = "projectActivities";

export type Schema =
	| User
	| Event
	| Activity
	| Chat
	| Session
	| GroupChat
	| Invitation
	| Note
	| Phase
	| Project
	| ProjectActivity;

export type StringSchema =
	| StringUser
	| StringEvent
	| StringActivity
	| StringChat
	| StringSession
	| StringGroupChat
	| StringInvitation
	| StringNote
	| StringPhase
	| StringProject
	| StringProjectActivity;

export async function getCollection<T extends Schema>(
	collectionName: string
): Promise<Collection<T>> {
	const client: MongoClient = await clientPromise;
	const db = client.db(DB_NAME);
	return db.collection(collectionName);
}

export async function addToCollection<T extends Schema>(
	data: T,
	client: Collection<T>
): Promise<boolean | undefined> {
	try {
		return (await client.insertOne(data as OptionalUnlessRequiredId<T>))
			.acknowledged;
	} catch (error: any) {
		return undefined;
	}
}

export async function addAndFetchToCollection<T extends Schema>(
	data: T,
	client: Collection<T>
): Promise<WithId<T> | undefined | null> {
	try {
		const id = (await client.insertOne(data as OptionalUnlessRequiredId<T>))
			.insertedId;
		return await client.findOne({ _id: id } as any);
	} catch (error: any) {
		return undefined;
	}
}

export async function findInCollection<T extends Schema>(
	data: Object,
	client: Collection<T>
): Promise<WithId<T>[] | undefined> {
	try {
		const output: WithId<T>[] = await client.find(data).toArray();
		return output;
	} catch (error: any) {
		return undefined;
	}
}

export async function deleteInCollection<T extends Schema>(
	data: ObjectId,
	client: Collection<T>
): Promise<number | undefined> {
	try {
		return (await client.deleteOne({ _id: data } as any)).deletedCount;
	} catch (error: any) {
		return undefined;
	}
}

export async function deleteManyInCollection<T extends Schema>(
	data: Object,
	client: Collection<T>
): Promise<number | undefined> {
	try {
		return (await client.deleteMany(data)).deletedCount;
	} catch (error: any) {
		return undefined;
	}
}

export async function updateOneInCollection<T extends Schema>(
	_id: ObjectId,
	data: T,
	client: Collection<T>
): Promise<number | undefined> {
	try {
		return (await client.updateOne({ _id: _id } as any, data as any))
			.modifiedCount;
	} catch (error: any) {
		return undefined;
	}
}

export async function updateOneAndFetchInCollection<T extends Schema>(
	_id: ObjectId,
	data: T,
	client: Collection<T>
): Promise<WithId<T> | undefined | null> {
	try {
		return await client.findOneAndUpdate({ _id: _id } as any, data as any, {
			returnDocument: "after"
		});
	} catch (error: any) {
		return undefined;
	}
}

export async function updateManyInCollection<T extends Schema>(
	filter: Object,
	data: Object,
	client: Collection<T>
): Promise<number | undefined> {
	try {
		return (await client.updateMany(filter, data as any)).modifiedCount;
	} catch (error: any) {
		return undefined;
	}
}

export async function updateManyAndFetchInCollection<T extends Schema>(
	filter: Object,
	data: Object,
	client: Collection<T>
): Promise<WithId<T>[] | undefined> {
	try {
		await client.updateMany(filter, data as any);
		return await client.find(filter).toArray();
	} catch (error: any) {
		return undefined;
	}
}
