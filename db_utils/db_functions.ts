import {
	Collection,
	MongoClient,
	ObjectId,
	OptionalUnlessRequiredId,
	WithId,
} from "mongodb";
import clientPromise from "@/db_utils/db";
import { User } from "@/db_utils/models/User";
import { Event } from "@/db_utils/models/Event";
import { Activity } from "@/db_utils/models/Activity";
import { Chat } from "@/db_utils/models/Chat";
import { EventSession } from "@/db_utils/models/EventSession";
import { GroupChat } from "@/db_utils/models/GroupChat";
import { Notes } from "@/db_utils/models/Notes";
import { Phase } from "@/db_utils/models/Phase";
import { Project } from "@/db_utils/models/Project";
import { ProjectActivity } from "@/db_utils/models/ProjectActivity";

const DB_NAME = "Selfie";

export const USER_COLLECTION = "users";
export const EVENT_COLLECTION = "events";
export const ACTIVITY_COLLECTION = "activities";
export const CHAT_COLLECTION = "chats";
export const EVENT_SESSION_COLLECTION = "eventSessions";
export const GROUP_CHAT_COLLECTION = "groupChats";
export const NOTES_COLLECTION = "notes";
export const PHASE_COLLECTION = "phases";
export const PROJECT_COLLECTION = "projects";
export const PROJECT_ACTIVITY_COLLECTION = "projectActivities";

type Schema =
	| User
	| Event
	| Activity
	| Chat
	| EventSession
	| GroupChat
	| Notes
	| Phase
	| Project
	| ProjectActivity;

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

export async function updateOneInCollection<T extends Schema>(
	_id: ObjectId,
	data: T,
	client: Collection<T>
): Promise<number | undefined> {
	try {
		return (
			await client.updateOne({ _id: _id } as any, { $set: data } as any)
		).modifiedCount;
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
		return await client.findOneAndUpdate(
			{ _id: _id } as any,
			{ $set: data } as any,
			{ returnDocument: "after" }
		);
	} catch (error: any) {
		return undefined;
	}
}
