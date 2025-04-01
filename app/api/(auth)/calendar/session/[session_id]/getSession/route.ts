import {
	generateMessageResponse,
	generateObjectResponse,
	validate
} from "@/utils/api/api";
import {
	SESSION_COLLECTION,
	Session,
	StringPomodoroSettings,
	StringSession,
	findCollectionWrapper,
	getCollection
} from "@/utils/db/db";
import { timeMachine } from "@/utils/timeMachine/timeMachine";
import { Collection } from "mongodb";
import { ObjectId } from "mongodb";
import { NextRequest } from "next/server";

interface SessionResponse {
	settings: StringPomodoroSettings;
	cycles: number;
}

export const GET = async (
	request: NextRequest,
	{ params }: { params: { session_id: string } }
) => {
	// Validazione della richiesta
	const validation = await validate<{}>(request, {}, false);

	// Se la validazione fallisce, ritorna il messaggio di errore
	if (validation === null) {
		return generateMessageResponse("Invalid request", 400);
	}

	// Estraiamo l'utente e il corpo della richiesta
	const { user: user, body: newBody } = validation;

	// Otteniamo l'ID della chat dall'URL
	if (!ObjectId.isValid(params.session_id)) {
		return generateMessageResponse("Invalid chat ID", 400);
	}
	const sessionId: string = params.session_id;

	// Estraggo l'id dell'utente
	const userId: string = user._id!;

	// Otteniamo la collezione delle sessioni
	const sessionClient: Collection<Session> =
		await getCollection<Session>(SESSION_COLLECTION);

	const out = await findCollectionWrapper<Session>(
		{ _id: sessionId } as any,
		sessionClient
	);

	if (out.status !== 200) {
		return out;
	}

	const session: StringSession = (await out.json())[0];

	// Otteniamo il giorno tramite timeMachine
	const today: string = timeMachine.timeMachineTime.toDateString();

	// Cerchiamo quali sono le impostazioni che si applicano al momento corrente
	const settingsListBeforeToday = session.settingsList
		.filter((s) => new Date(s.modificationDate) <= new Date(today))
		.sort(
			(a, b) =>
				new Date(b.modificationDate).getTime() -
				new Date(a.modificationDate).getTime()
		);
	const lastSettings = settingsListBeforeToday[0];

	// Cerchiamo il giorno all'interno di completedCycles
	const dayEntry = session.completedCycles.find((day) => day.date === today);
	const day = dayEntry ? dayEntry.cycles : 0;

	const response: SessionResponse = {
		settings: lastSettings,
		cycles: day
	};

	// Dobbiamo aggiungere il cicli di debito accumulato ai cicli dei settings
	// Calcolo del debito accumulato
	let totalDebt = 0;
	let currentDate = new Date(session.settingsList[0].modificationDate);
	const endDate = new Date(today);

	while (currentDate <= endDate) {
		const dateStr = currentDate.toDateString();
		// Troviamo il setting appropriato per questo giorno
		const applicableSettings = session.settingsList
			.filter((s) => new Date(s.modificationDate) <= currentDate)
			.sort(
				(a, b) =>
					new Date(b.modificationDate).getTime() -
					new Date(a.modificationDate).getTime()
			);
		const dailySettings = applicableSettings[0];

		// Calcoliamo i cicli svolti o 0 se il giorno non è presente
		const dayEntry = session.completedCycles.find(
			(dc) => dc.date === dateStr
		);
		const completed = dayEntry ? dayEntry.cycles : 0;

		// Prendiamo i cicli che erano da fare in quel giorno
		const dailyGoal = dailySettings.cycles;

		// Aggiungiamo il debito di giornata
		// (se è minore di 0, significa che ha recuperato debito)
		totalDebt += dailyGoal - completed;

		// Avanziamo di un giorno
		currentDate.setDate(currentDate.getDate() + 1);
	}

	if (totalDebt < 0) {
		console.warn("[POMODORO] Debito negativo trovato!");
		totalDebt = 0;
	}

	// I cicli da svolgere sono quelli già svolti oggi + il debito
	response.settings.cycles = response.cycles + totalDebt;

	return generateObjectResponse(response, 200);
};
