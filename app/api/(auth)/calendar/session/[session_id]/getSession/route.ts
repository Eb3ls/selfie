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
	getCollection,
	updateCollectionWrapper
} from "@/utils/db/db";
import { timeMachine } from "@/utils/timeMachine/timeMachine";
import { Collection } from "mongodb";
import { ObjectId } from "mongodb";
import { NextRequest } from "next/server";
import { rrulestr } from "rrule";

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

	// Otteniamo il giorno tramite timeMachine
	const today: string = timeMachine.timeMachineTime.toDateString();

	// Otteniamo la collezione delle sessioni
	const sessionClient: Collection<Session> =
		await getCollection<Session>(SESSION_COLLECTION);

	const outBefore = await findCollectionWrapper<Session>(
		{ _id: sessionId } as any,
		sessionClient
	);

	if (outBefore.status !== 200) {
		return outBefore;
	}

	const sessionBefore: StringSession = (await outBefore.json())[0];

	// Rimuoviamo tutti gli elementi in completedCycles che sono futuri rispetto a TimeMachine
	sessionBefore.completedCycles = sessionBefore.completedCycles.filter(
		(element) => {
			return new Date(element.date) <= new Date(today);
		}
	);

	// Modifichiamo la sessione
	const updateOut = await updateCollectionWrapper<Session>(
		{ _id: sessionId },
		{ $set: sessionBefore } as any,
		sessionClient
	);

	if (updateOut.status !== 200) {
		return updateOut;
	}

	const out = await findCollectionWrapper<Session>(
		{ _id: sessionId } as any,
		sessionClient
	);

	if (out.status !== 200) {
		return out;
	}

	const session: StringSession = (await out.json())[0];

	// Controlliamo che la data dalla timeMachine sia successiva alla data di inizio della sessione
	if (
		new Date(timeMachine.timeMachineTime.toDateString()) <
		new Date(new Date(session.dtStart).toDateString())
	) {
		return generateMessageResponse(
			"TimeMachine date is before session start date",
			475
		);
	}

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
	// Prima troviamo i cicli svolti, poi quelli da svolgere e infine il debito

	// Cicli svolti
	let workDone = 0;

	for (const day of session.completedCycles) {
		workDone += day.cycles;
	}

	// Cicli da svolgere
	let workToDo = 0;

	const startDate = new Date(session.dtStart);
	const endDate = new Date(timeMachine.timeMachineTime);

	// Calcoliamo le occorrenze tramite rrule
	const rule = rrulestr(session.rrule, {
		dtstart: new Date(session.dtStart)
	});

	const occurrences = rule.between(startDate, endDate, true);
	// Calcoliamo il numero di cicli da svolgere
	for (const occurrence of occurrences) {
		// Cerchiamo quali sono le impostazioni che si applicano al momento corrente
		const settingsListBeforeOccurrence = session.settingsList
			.filter((s) => new Date(s.modificationDate) <= occurrence)
			.sort(
				(a, b) =>
					new Date(b.modificationDate).getTime() -
					new Date(a.modificationDate).getTime()
			);
		const lastSettings = settingsListBeforeOccurrence[0];
		workToDo += lastSettings.cycles;
	}

	// Debito totale
	let totalDebt = workToDo - workDone;

	if (totalDebt < 0) {
		console.warn("[POMODORO] Debito negativo trovato!");
		totalDebt = 0;
	}

	// I cicli da svolgere sono quelli già svolti oggi + il debito
	response.settings.cycles = response.cycles + totalDebt;

	return generateObjectResponse(response, 200);
};
