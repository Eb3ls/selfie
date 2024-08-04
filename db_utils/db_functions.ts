import { Collection, MongoClient } from "mongodb";
import clientPromise from "@/db_utils/db";
import { User } from "@/db_utils/models/User";
import { Event } from "@/db_utils/models/Event";

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
