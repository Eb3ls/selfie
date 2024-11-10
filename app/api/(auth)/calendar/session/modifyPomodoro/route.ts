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
	_id: "", // Id della sessione
	cycles: 0
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

	// Estraiamo il numero di cicli
	const cycles: number = newBody.cycles!;

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

	// Controlliamo che il numero di cicli sia maggiore o uguale a 0
	if (cycles < 0) {
		return generateMessageResponse("Invalid number of cycles", 400);
	}

	// TODO: Controllare che il numero di cicli sia inferiore al debito accumulato

	// Rimuoviamo tutti gli elementi in completedCycles che sono futuri rispetto a TimeMachine
	const todayDate: string = timeMachine.timeMachineTime.toDateString();
	session[0].completedCycles = session[0].completedCycles.filter(
		(element) => {
			return new Date(element.date) <= new Date(todayDate);
		}
	);

	// Controlliamo se in completedCycles c'è la giornata odierna secondo TimeMachine
	const today: string = timeMachine.timeMachineTime.toDateString();
	const completedCycles = session[0].completedCycles;
	const found = completedCycles.find((element) => {
		return element.date === today;
	});

	if (found === undefined) {
		session[0].completedCycles.push({
			date: today,
			cycles: 0
		});
	}

	// Modifichiamo il numero di cicli
	session[0].completedCycles.forEach((element) => {
		if (element.date === today) {
			element.cycles = cycles;
		}
	});

	// Modifichiamo la sessione
	const updateOut = await updateCollectionWrapper<Session>(
		{ _id: sessionId },
		{ $set: { completedCycles: session[0].completedCycles } } as any,
		client
	);

	if (updateOut.status !== 200) {
		return updateOut;
	}

	const updatedActivity: StringSession = (await updateOut.json())[0];

	return generateObjectResponse(updatedActivity, 200);
};
