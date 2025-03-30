import { generateMessageResponse, validate } from "@/utils/api/api";
import { handleOverdues } from "@/utils/projects/projects";
import { NextRequest } from "next/server";

export const GET = async (request: NextRequest) => {
	// Validazione della richiesta
	const validation = await validate<{}>(request, {}, false);

	// Se la validazione fallisce, ritorna il messaggio di errore
	if (validation === null) {
		return generateMessageResponse("Invalid request", 400);
	}

	return await handleOverdues();
};
