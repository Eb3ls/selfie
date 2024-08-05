import { Collection, MongoClient } from "mongodb";
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

export async function getUsersCollection(): Promise<Collection<User>> {
	const client: MongoClient = await clientPromise;
	const db = client.db(DB_NAME);
	return db.collection("users");
}

export async function getEventsCollection(): Promise<Collection<Event>> {
	const client: MongoClient = await clientPromise;
	const db = client.db(DB_NAME);
	return db.collection("events");
}

export async function getActivitiesCollection(): Promise<Collection<Activity>> {
	const client: MongoClient = await clientPromise;
	const db = client.db(DB_NAME);
	return db.collection("activities");
}

export async function getChatsCollection(): Promise<Collection<Chat>> {
	const client: MongoClient = await clientPromise;
	const db = client.db(DB_NAME);
	return db.collection("chats");
}

export async function getEventSessionsCollection(): Promise<
	Collection<EventSession>
> {
	const client: MongoClient = await clientPromise;
	const db = client.db(DB_NAME);
	return db.collection("eventSessions");
}

export async function getGroupChatsCollection(): Promise<
	Collection<GroupChat>
> {
	const client: MongoClient = await clientPromise;
	const db = client.db(DB_NAME);
	return db.collection("groupChats");
}

export async function getNotesCollection(): Promise<Collection<Notes>> {
	const client: MongoClient = await clientPromise;
	const db = client.db(DB_NAME);
	return db.collection("notes");
}

export async function getPhasesCollection(): Promise<Collection<Phase>> {
	const client: MongoClient = await clientPromise;
	const db = client.db(DB_NAME);
	return db.collection("phases");
}

export async function getProjectsCollection(): Promise<Collection<Project>> {
	const client: MongoClient = await clientPromise;
	const db = client.db(DB_NAME);
	return db.collection("projects");
}

export async function getProjectActivitiesCollection(): Promise<
	Collection<ProjectActivity>
> {
	const client: MongoClient = await clientPromise;
	const db = client.db(DB_NAME);
	return db.collection("projectActivities");
}
