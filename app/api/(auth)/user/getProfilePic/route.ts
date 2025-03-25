import { DEFAULT_PROFILE_FOLDER, DEFAULT_PROFILE_IMAGE } from "@/app/constants";
import { generateMessageResponse, validate } from "@/utils/api/api";
import { readFileSync, readdirSync } from "fs";
import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";
import path from "path";

export const GET = async (request: NextRequest) => {
	// Validazione della richiesta
	const validation = await validate<{}>(request, {}, false);

	// Se la validazione fallisce, ritorna il messaggio di errore
	if (validation === null) {
		return generateMessageResponse("Invalid request", 400);
	}

	// Estraiamo l'utente e il corpo della richiesta
	const { user: user, body: newBody } = validation;

	const URL_ID = request.nextUrl.searchParams.get("ID");

	// Estraiamo l'id dall'URL. Se non è presente, usiamo l'immagine di default
	const userId: string = URL_ID || DEFAULT_PROFILE_IMAGE;

	// Controlliamo che l'id sia valido
	if (
		ObjectId.isValid(userId) === false &&
		userId !== DEFAULT_PROFILE_IMAGE
	) {
		return generateMessageResponse("Invalid user ID", 400);
	}

	// Percorso dell'immagine
	const uploadDir = path.join(process.cwd(), DEFAULT_PROFILE_FOLDER);

	// Legge i file nella cartella
	const files = readdirSync(uploadDir);

	// Cerca il file con l'ID fornito (indipendentemente dall'estensione)
	const fileName = files.find((file) => file.startsWith(userId + "."));

	let imagePath = path.join(uploadDir, DEFAULT_PROFILE_IMAGE);

	// Se l'immagine esiste, ritorna il percorso
	if (fileName) {
		imagePath = path.join(uploadDir, fileName);
	}

	// Otteniamo l'estensione dell'immagine
	const extension = path.extname(imagePath);

	// Ritorna l'immagine
	const image = readFileSync(imagePath);

	return new NextResponse(image, {
		headers: {
			"Content-Type": "image/" + extension.replace(".", ""),
			"Cache-Control":
				"no-store, no-cache, must-revalidate, proxy-revalidate",
			Pragma: "no-cache",
			Expires: "0"
		}
	});
};
