import { CalendarForm } from "@/app/components/CalendarForm";
import { getSession } from "@/utils/session/session";
import { cookies } from "next/headers";

export default async function Calendar() {
	const session = await getSession(cookies());

	return (
		<main className="flex min-h-screen flex-col items-center justify-between p-24">
			<CalendarForm />
		</main>
	);
}
