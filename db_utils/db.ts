const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = "Selfie";

async function connect() {
	console.log("Connecting to MongoDB...");
	console.log(MONGODB_URI);
}

export default connect;
