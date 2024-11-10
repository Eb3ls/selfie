import {
	generateMessageResponse,
	isISO8601,
	isTemplateValid,
	parseJSONInput
} from "@/utils/api/api";
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

	console.log(
		"Data attuale:",
		new Date(baseDate.getTime() + ms_diff).toString()
	);

	timeMachine.timeMachineTime = new Date(baseDate.getTime() + ms_diff);
}

export const GET = async (request: NextRequest) => {
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
	if (!isISO8601(body.requestedDate)) {
		return generateMessageResponse("Invalid format for the date", 400);
	}

	const currentDate: Date = new Date();

	// Se l'utente vuole la data in tempo reale
	if (body.realTime) {
		baseDate = currentDate;
		dateOfChange = currentDate;
	} else {
		baseDate = new Date(body.requestedDate);
		dateOfChange = currentDate;
	}

	return generateMessageResponse("Service time updated", 200);
};
