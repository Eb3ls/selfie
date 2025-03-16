const path = require("path");

console.log("Hello! Starting Next.js server...");

// Define the new directory path
const newDir = path.join(__dirname, "");

// Change the current working directory to the new directory
try {
	process.chdir(newDir);
	console.log("New Directory:", process.cwd());
	console.log("Starting Next.js with this CWD...");
	const starter = require("next/dist/cli/next-start");
	starter.nextStart({ port: 8000 });
} catch (err) {
	console.error("Failed to change directory:", err);
}
