import connect from "@/db_utils/db";

export default function Home() {
	connect();
	return (
		<main className="flex min-h-screen flex-col items-center justify-between p-24">
			<h1>Selfie!</h1>
		</main>
	);
}
