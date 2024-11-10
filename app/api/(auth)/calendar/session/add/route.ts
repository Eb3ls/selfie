import {
	generateMessageResponse,
	generateStringModel,
	validate
} from "@/utils/api/api";
import {
	SESSION_COLLECTION,
	Session,
	StringSession,
	addCollectionWrapper,
	getCollection
} from "@/utils/db/db";
import { timeMachine } from "@/utils/timeMachine/timeMachine";
import { Collection } from "mongodb";
import { NextRequest } from "next/server";

const requestTemplate = {
	summary: "",
	description: "",
	status: "",
	rrule: "",
	dtStart: "",
	dtEnd: "",
	settings: {
		cycles: 0,
		studyTime: 0,
		breakTime: 0
	}
};

type RequestType = typeof requestTemplate;

export const POST = async (request: NextRequest) => {
	// Validazione della richiesta
	const validation = await validate<RequestType>(
		request,
		requestTemplate,
		false
	);

	// Se la validazione fallisce, ritorna il messaggio di errore
	if (validation === null) {
		return generateMessageResponse("Invalid request", 400);
	}

	// Estraiamo l'utente e il corpo della richiesta
	const { user: owner, body: newBody } = validation;

	// Estraiamo le impostazioni da newBody
	const settings = newBody.settings;

	// Assumiamo che la validazione abbia validato anche il pomodoro

	// Creiamo una nuova sessione con quei campi
	const newSession: StringSession = generateStringModel<StringSession>(
		newBody,
		"Session"
	);

	// Aggiungiamo le impostazioni alla lista delle impostazioni
	newSession.settingsList = [
		{
			modificationDate: timeMachine.timeMachineTime.toDateString(),
			cycles: settings.cycles,
			studyTime: settings.studyTime,
			breakTime: settings.breakTime
		}
	];

	// Controlliamo che la data di inizio sia nello stesso giorno della data di fine
	const dtStart = new Date(newSession.dtStart).toDateString();
	const dtEnd = new Date(newSession.dtEnd).toDateString();

	if (dtStart !== dtEnd) {
		return generateMessageResponse(
			"Start date and end date are not in the same day",
			400
		);
	}

	// Aggiungiamo il campo 'owner' a newSession
	newSession.ownerId = owner._id!;

	// Ottieniamo la collezione delle sessioni
	const client: Collection<Session> =
		await getCollection<Session>(SESSION_COLLECTION);

	return await addCollectionWrapper(newSession, client);
};
