import { DEFAULT_PROFILE_FOLDER } from "@/app/constants";
import { generateMessageResponse, validate } from "@/utils/api/api";
import { mkdirSync, writeFileSync } from "fs";
import { NextRequest } from "next/server";
import path from "path";

const requestTemplate = {
	base64Image: ""
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
	const { user: user, body: newBody } = validation;

	// Estraiamo l'id dell'utente
	const userId: string = user._id!;

	// Estraiamo l'immagine base64 dal corpo della richiesta
	let base64Image: string = newBody.base64Image;

	// Verifichiamo che il base64 sia un immagine
	if (!base64Image.startsWith("data:image/")) {
		return generateMessageResponse("Invalid image", 400);
	}

	// Rimuoviamo l'intestazione dell'immagine
	base64Image = base64Image.replace("data:image/", "");

	// Otteniamo il tipo di immagine
	const imageType = base64Image.split(";")[0];

	// Verifichiamo che il tipo sia tra quelli supportati
	if (!["png", "jpeg", "jpg"].includes(imageType)) {
		return generateMessageResponse("Invalid image type", 400);
	}

	// Rimuoviamo il tipo di immagine
	base64Image = base64Image.replace(imageType + ";base64,", "");

	// Decodifichiamo l'immagine
	const buffer = Buffer.from(base64Image, "base64");

	// Percorso di salvataggio
	const uploadDir = path.join(process.cwd(), DEFAULT_PROFILE_FOLDER);
	mkdirSync(uploadDir, { recursive: true });

	// Salviamo l'immagine
	const filePath = path.join(uploadDir, userId + "." + imageType);
	writeFileSync(filePath, new Uint8Array(buffer));

	return generateMessageResponse("Image uploaded", 200);
};
