import { NextRequest } from "next/server";
import { Collection, ObjectId } from "mongodb";
import {
	getCollection,
	PROJECT_ACTIVITY_COLLECTION,
} from "@/db_utils/db_functions";
import {
	findCollectionWrapper,
	deleteCollectionWrapper,
	updateOneCollectionWrapper,
} from "@/db_utils/db_wrappers";
import { ProjectActivity } from "@/db_utils/models/ProjectActivity";
import {
	generateMessageResponse,
	generateObjectResponse,
	standardValidation,
} from "@/api_utils/api_functions";

const requestTemplate: Object = {
	prevId: new ObjectId(),
	nextId: new ObjectId(),
};

export const PATCH = async (request: NextRequest) => {
	// Validazione standard
	const validation = await standardValidation(request, requestTemplate, true);

	// Se la validazione fallisce, ritorna il messaggio di errore
	if (validation === null) {
		return generateMessageResponse("Invalid request", 400);
	}

	// Estraiamo l'utente e il corpo della richiesta
	const { user: user, body: body } = validation;

	// Estraiamo l'utente
	const senderId: ObjectId = user._id!;

	// Estraiamo l'id delle attività
	const { prevId, nextId } = body as { prevId: ObjectId; nextId: ObjectId };

	if (prevId.equals(nextId)) {
		return generateMessageResponse(
			"The projectActivities can't be the same",
			400
		);
	}

	// Otteniamo la collezione delle attività
	const projectActivityClient: Collection<ProjectActivity> =
		await getCollection<ProjectActivity>(PROJECT_ACTIVITY_COLLECTION);

	const prevOut = await findCollectionWrapper<ProjectActivity>(
		{ _id: prevId, ownerId: senderId },
		projectActivityClient
	);

	// Se l'attività non esiste, ritorna un errore
	if (prevOut.status !== 200) {
		return prevOut;
	}

	const prevActivity: ProjectActivity = (await prevOut.json())[0];

	// Controllo se l'attività è già collegata
	if (prevActivity.nextIdList.includes(nextId)) {
		return generateMessageResponse("Already linked", 400);
	}

	const nextOut = await findCollectionWrapper<ProjectActivity>(
		{
			_id: nextId,
			ownerId: senderId, // Non serve ma lo lascio per chiarezza
			// Controlliamo che appartengano allo stesso progetto
			projectId: new ObjectId(prevActivity.projectId),
		},
		projectActivityClient
	);

	// Se l'attività non esiste, ritorna un errore
	if (nextOut.status !== 200) {
		return nextOut;
	}

	const nextActivity: ProjectActivity = (await nextOut.json())[0];

	// Se l'attività successiva è prima di quella precedente, ritorna un errore
	if (
		prevActivity.dtStart > nextActivity.dtStart ||
		prevActivity.due > nextActivity.due
	) {
		return generateMessageResponse(
			"Activities can't be in the same period of time",
			400
		);
	}

	// Inseriamo l'id dell'attività precedente nell'array delle attività precedenti del next
	const nextModifiedIds = nextActivity.prevIdList
		.map((user) => new ObjectId(user))
		.concat(prevId);
	// Inseriamo l'id dell'attività successiva nell'array delle attività successive del prev
	const prevModifiedIds = prevActivity.nextIdList
		.map((user) => new ObjectId(user))
		.concat(nextId);
	const prevModified = await updateOneCollectionWrapper<ProjectActivity>(
		prevId,
		{ nextIdList: prevModifiedIds } as ProjectActivity,
		projectActivityClient
	);

	if (prevModified.status !== 200) {
		return prevModified;
	}

	const nextModified = await updateOneCollectionWrapper<ProjectActivity>(
		nextId,
		{ prevIdList: nextModifiedIds, status: "WAITING" } as ProjectActivity,
		projectActivityClient
	);

	if (nextModified.status !== 200) {
		return nextModified;
	}

	const prevModifiedData = await prevModified.json();
	const nextModifiedData = await nextModified.json();

	return generateObjectResponse(
		{ prevData: prevModifiedData, nextData: nextModifiedData },
		200
	);

	// TODO: Le attività non possono essere linkate se completate
};
