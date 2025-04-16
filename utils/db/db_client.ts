import { MongoClient } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI as string;
const options = {};

class DB {
	private static _instance: DB;
	private selfie_dbPromise: Promise<MongoClient>;

	private constructor() {
		const selfie_db = new MongoClient(MONGODB_URI, options);
		this.selfie_dbPromise = selfie_db.connect();
	}

	public static get instance() {
		if (!this._instance) {
			this._instance = new DB();
		}
		return this._instance.selfie_dbPromise;
	}
}

export const clientPromise: Promise<MongoClient> = DB.instance;
