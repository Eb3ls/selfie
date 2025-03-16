import {
	generateMessageResponse,
	isEmailValid,
	isTemplateValid,
	parseJSONInput
} from "@/utils/api/api";
import { encrypt } from "@/utils/session/session";
import { NextRequest } from "next/server";
import nodemailer from "nodemailer";

const GMAIL_EMAIL: string = process.env.GMAIL_EMAIL as string;
const GMAIL_PASSWORD: string = process.env.GMAIL_PASSWORD as string;

// Imposta l'account Gmail di Nodemailer
const transporter = nodemailer.createTransport({
	service: "gmail",
	auth: {
		user: GMAIL_EMAIL,
		pass: GMAIL_PASSWORD
	}
});

/* Inizio API */

const requestTemplate = {
	email: ""
};

type RequestType = typeof requestTemplate;

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

	if (!isEmailValid(body.email)) {
		return generateMessageResponse("Invalid email", 400);
	}

	// Generiamo il token JWT per la verifica dell'email
	const token: string = await encrypt({ email: body.email }, "20m");

	const messageContent: string =
		"Ciao! Ti diamo il benvenuto su Selfie! Per completare la registrazione, copia questo token e inseriscilo nella pagina web: " +
		token;

	// Inviamo l'email
	try {
		const emailOptions = {
			from: GMAIL_EMAIL,
			to: body.email,
			subject: "Benvenuto su Selfie!",
			text: messageContent
		};

		const info = await transporter.sendMail(emailOptions);
		console.log(
			`Email inviata a: ${body.email}. ID messaggio: ${info.messageId}`
		);
		return generateMessageResponse("Email sent", 200);
	} catch (error) {
		console.error(
			`Errore durante l'invio dell'email a: ${body.email}. Dettagli: ${error}`
		);
		return generateMessageResponse("Failed to send email", 500);
	}
};
