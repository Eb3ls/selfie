import { generateMessageResponse, validate } from "@/utils/api/api";
import {
	PROJECT_ACTIVITY_COLLECTION,
	ProjectActivity,
	StringProjectActivity,
	findCollectionWrapper,
	getCollection,
	updateCollectionWrapper
} from "@/utils/db/db";
import { Collection } from "mongodb";
import { NextRequest } from "next/server";

const requestTemplate = {
	_id: "",
	shifting: ""
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

	// Prendo l'attività da aggiornare
	const projectActivityClient: Collection<ProjectActivity> =
		await getCollection<ProjectActivity>(PROJECT_ACTIVITY_COLLECTION);

	const projectActivityOut = await findCollectionWrapper<ProjectActivity>(
		{ _id: newBody._id },
		projectActivityClient
	);

	if (projectActivityOut.status !== 200) {
		return generateMessageResponse("ProjectActivity not found", 404);
	}

	const projectActivity: StringProjectActivity = (
		await projectActivityOut.json()
	)[0];

	// Controllo che l'utente sia l'owner del progetto
	if (projectActivity.ownerId !== user._id) {
		return generateMessageResponse("User not authorized", 401);
	}

	// Controllo che l'attività sia OVERDUE e shitting NONE
	if (
		projectActivity.status !== "OVERDUE" ||
		projectActivity.shifting !== "NONE"
	) {
		return generateMessageResponse(
			"ProjectActivity not in the right state",
			400
		);
	}

	// Controllo che shifting sia uno dei valori validi
	if (newBody.shifting !== "TOSHIFT" && newBody.shifting !== "FIXED") {
		return generateMessageResponse("Shifting not valid", 400);
	}

	// Aggiorno l'attività
	const updateOut = await updateCollectionWrapper<ProjectActivity>(
		{ _id: newBody._id },
		{ $set: { shifting: newBody.shifting } } as any,
		projectActivityClient
	);

	if (updateOut.status !== 200) {
		return updateOut;
	}

	return generateMessageResponse("ProjectActivity updated", 200);
};
