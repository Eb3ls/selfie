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

	// Controlliamo che il giorno richiesto sia compatibile con la RRULE

	// Cerchiamo qual'è la data all'interno di settingsList che viene prima di today ma per ultima
	let lastSettings = session.settingsList[0];
	session.settingsList.forEach((settings) => {
		if (new Date(settings.modificationDate) <= new Date(today)) {
			lastSettings.modificationDate = settings.modificationDate;
		}
	});

	// Cerchiamo il giorno all'interno di completedCycles
	const day = session.completedCycles.find((day) => day.date === today);

	let response: SessionResponse;

	if (day === undefined) {
		response = {
			settings: lastSettings,
			cycles: 0
		};
	} else {
		response = {
			settings: lastSettings,
			cycles: day.cycles
		};
	}

	return generateObjectResponse(response, 200);
};
