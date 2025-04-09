import {
	generateMessageResponse,
	generateObjectResponse,
	isTemplateValid,
	parseJSONInput
} from "@/utils/api/api";
import { handleOverdues } from "@/utils/projects/projects";
import { notifyAll } from "@/utils/timeMachine/getFromDB";
import { timeMachine } from "@/utils/timeMachine/timeMachine";
import { NextRequest } from "next/server";

let baseDate: Date = new Date(); // Data di partenza selezionata (default: tempo reale)
let dateOfChange: Date = new Date(); // Data dell'ultima richiesta di cambio della data da parte di un utente

let isServiceActive: boolean = false; // Se il servizio è attivo o meno
let backgroundServiceInterval: NodeJS.Timeout; // Oggetto per l'intervallo di tempo del servizio

const requestTemplate = {
	realTime: false,
	requestedDate: "1970-01-01T00:00:00.000Z"
};

type RequestType = typeof requestTemplate;

function backgroundServiceFunction() {
	// Calcoliamo quanto tempo è passato dall'ultima richiesta di cambio della data ad ora
	const ms_diff: number = new Date().getTime() - dateOfChange.getTime();

	const new_time = new Date(baseDate.getTime() + ms_diff);

	console.log("Data attuale:", new_time.toString());

	timeMachine.timeMachineTime = new_time;

	// Dobbiamo verificare nel database se ci sono eventi che iniziano in questo momento
	// e notificare gli utenti interessati.
	// Non facciamo await qui, perché non ci interessa aspettare che la funzione finisca.
	notifyAll(new_time);

	// Se è mezzanotte, avviamo la funzione per gestire le scadenze dei progetti
	if (
		new_time.getHours() === 0 &&
		new_time.getMinutes() === 0 &&
		new_time.getSeconds() === 0
	) {
		handleOverdues(new_time);
	}
}

export const PATCH = async (request: NextRequest) => {
	if (!isServiceActive) {
		baseDate = new Date();
		dateOfChange = new Date();

		isServiceActive = true;
		backgroundServiceInterval = setInterval(
			backgroundServiceFunction,
			1000
		);

		console.log("Background service attivato!");
	}

	return generateMessageResponse("Service activated", 200);
};

export const POST = async (request: NextRequest) => {
	// Convertiamo in JSON il body della richiesta
	const body: RequestType | undefined = await parseJSONInput(request);
	if (body === undefined) {
		return generateMessageResponse("Invalid input", 400);
	}

	// Controlliamo che il body abbia tutti i campi necessari
	if (!isTemplateValid(body, requestTemplate)) {
		return generateMessageResponse("Invalid input", 400);
	}

	// Controlliamo che la data richiesta sia valida
	if (isNaN(new Date(body.requestedDate).getTime())) {
		return generateMessageResponse("Invalid format for the date", 400);
	}

	const currentDate: Date = new Date();

	// Controlliamo se la data richiesta è nel futuro
	if (new Date(body.requestedDate) > currentDate) {
		const dateAt00: Date = new Date(currentDate);
		dateAt00.setHours(0, 0, 0, 0);
		dateAt00.setDate(dateAt00.getDate() + 1);

		// Per ogni giornata fra la data attuale e la data richiesta, dobbiamo
		// richiamare la funzione per gestire le scadenze dei progetti
		while (dateAt00 <= new Date(body.requestedDate)) {
			await handleOverdues(dateAt00);
			dateAt00.setDate(dateAt00.getDate() + 1);
		}
	}

	// Se l'utente vuole la data in tempo reale
	if (body.realTime) {
		baseDate = currentDate;
		dateOfChange = currentDate;
	} else {
		baseDate = new Date(body.requestedDate);
		dateOfChange = currentDate;
	}

	backgroundServiceFunction();

	return generateMessageResponse("Service time updated", 200);
};

export const GET = async (request: NextRequest) => {
	const currentDate: Date = timeMachine.timeMachineTime;

	if (currentDate === undefined) {
		return generateMessageResponse("Service not activated", 400);
	}

	const response = {
		time: currentDate
	};

	return generateObjectResponse(response, 200);
};
