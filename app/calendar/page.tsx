import { getSession } from "@/session_utils/session";
import { cookies } from "next/headers";

export default async function Calendar() {
	const session = await getSession(cookies());

	return (
		<main className="flex min-h-screen flex-col items-center justify-between p-24">
			<h1>Pagina del calendario di: {}</h1>
		</main>
	);
}
