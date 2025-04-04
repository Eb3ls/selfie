import {
	generateMessageResponse,
	generateObjectResponse,
	validate
} from "@/utils/api/api";
import {
	SESSION_COLLECTION,
	Session,
	StringSession,
	findCollectionWrapper,
	getCollection,
	updateCollectionWrapper
} from "@/utils/db/db";
import { timeMachine } from "@/utils/timeMachine/timeMachine";
import { Collection } from "mongodb";
import { NextRequest } from "next/server";

const requestTemplate = {
	_id: "",
	summary: "",
	description: "",
	status: "",
	rrule: "",
	dtStart: "",
	dtEnd: "",
	newSetting: {
		cycles: 0,
		studyTime: 0,
		breakTime: 0
	},
	alarms: [],
	dateToChange: ""
};

type RequestType = typeof requestTemplate;

export const PATCH = async (request: NextRequest) => {
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
	const { user: user, body: newBody } = validation;

	// Estraiamo l'id dell'utente
	const userId: string = user._id!;

	// Estraiamo l'id dal body
	const sessionId: string = newBody._id!;

	// Creiamo un oggetto senza il campo id
	const { _id, ...newFields } = newBody;

	// Estraiamo le impostazioni da newFields
	const newSetting = newFields.newSetting;

	// Creiamo un oggetto senza il campo newSetting
	const { newSetting: _, ...readyFields } = newFields;

	// Ottieniamo la collezione delle sessioni
	const client: Collection<Session> =
		await getCollection<Session>(SESSION_COLLECTION);

	const out = await findCollectionWrapper<Session>(
		{ _id: sessionId },
		client
	);

	if (out.status !== 200) {
		return out;
	}

	const session: StringSession[] = await out.json();

	// Controlliamo che l'owner sia l'utente corrispondente
	if (session[0].ownerId !== userId) {
		return generateMessageResponse("Unauthorized", 400);
	}

	// Controlliamo che la data di inizio sia nello stesso giorno della data di fine
	const dtStart = new Date(newBody.dtStart).toDateString();
	const dtEnd = new Date(newBody.dtEnd).toDateString();

	if (dtStart !== dtEnd) {
		return generateMessageResponse(
			"Start date and end date are not in the same day",
			400
		);
	}

	// Controlliamo che il numero di cicli sia maggiore o uguale a 0
	if (newSetting.cycles <= 0) {
		return generateMessageResponse("Invalid number of cycles", 400);
	}
	// Controlliamo che il tempo di studio sia maggiore o uguale a 0
	if (newSetting.studyTime <= 0) {
		return generateMessageResponse("Invalid study time", 400);
	}
	// Controlliamo che il tempo di pausa sia maggiore o uguale a 0
	if (newSetting.breakTime <= 0) {
		return generateMessageResponse("Invalid break time", 400);
	}

	// Rimuoviamo tutti gli elementi in completedCycles che sono futuri rispetto a TimeMachine
	const today = timeMachine.timeMachineTime.toDateString();
	session[0].completedCycles = session[0].completedCycles.filter(
		(element) => {
			return new Date(element.date) <= new Date(today);
		}
	);

	const readyNewSetting = {
		modificationDate: newBody.dateToChange,
		...newSetting
	};

	let settingsList = session[0].settingsList;

	// Controlliamo se in settingsList c'è la giornata richiesta
	const found = settingsList.find((element) => {
		return (
			new Date(element.modificationDate).toDateString() ==
			new Date(newBody.dateToChange).toDateString()
		);
	});

	if (found) {
		const index = settingsList.indexOf(found);
		settingsList[index] = readyNewSetting;
	} else {
		settingsList.push(readyNewSetting);
	}

	const settingsReadyFields = {
		...readyFields,
		settingsList: settingsList,
		completedCycles: session[0].completedCycles
	};

	// Riordiniamo settingsList in ordine cronologico
	settingsReadyFields.settingsList.sort((a, b) => {
		return (
			new Date(a.modificationDate).getTime() -
			new Date(b.modificationDate).getTime()
		);
	});

	// Modifichiamo la sessione
	const updateOut = await updateCollectionWrapper<Session>(
		{ _id: sessionId },
		{ $set: settingsReadyFields } as any,
		client
	);

	if (updateOut.status !== 200) {
		return updateOut;
	}

	const updatedActivity: StringSession = (await updateOut.json())[0];

	return generateObjectResponse(updatedActivity, 200);
};
