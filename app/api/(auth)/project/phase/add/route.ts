import {
	generateMessageResponse,
	generateStringModel,
	validate
} from "@/utils/api/api";
import {
	ACTIVITY_COLLECTION,
	Activity,
	PHASE_COLLECTION,
	PROJECT_COLLECTION,
	Phase,
	Project,
	StringPhase,
	StringProject,
	addCollectionWrapper,
	findCollectionWrapper,
	getCollection
} from "@/utils/db/db";
import { Collection } from "mongodb";
import { NextRequest } from "next/server";

const requestTemplate = {
	summary: "",
	projectId: "",
	parentId: "",
	dtStart: "",
	due: ""
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

	//Estraiamo l'id dal body
	const projectId: string = newBody.projectId;

	//Estraiamo il parentId dal body
	const parentId: string = newBody.parentId;

	// Controlliamo che dtStart sia minore di due
	if (new Date(newBody.dtStart) >= new Date(newBody.due)) {
		return generateMessageResponse(
			"Activity start date is greater than or equal to due date",
			400
		);
	}

	// Se il titolo non é tra le 3 e le 50 lettere, ritorna un errore
	if (newBody.summary.length < 3 || newBody.summary.length > 50) {
		return generateMessageResponse("Invalid summary length", 400);
	}

	// Otteniamo la collezione dei progetti
	const projectClient: Collection<Project> =
		await getCollection<Project>(PROJECT_COLLECTION);

	const projectOut = await findCollectionWrapper<Project>(
		{ _id: projectId },
		projectClient
	);

	if (projectOut.status !== 200) {
		return projectOut;
	}

	const project: StringProject[] = await projectOut.json();

	// Controlliamo che l'owner sia l'utente corrispondente
	if (project[0].ownerId !== userId) {
		return generateMessageResponse("Unauthorized", 400);
	}

	//Otteniamo la collezione delle fasi
	const phaseClient: Collection<Phase> =
		await getCollection<Phase>(PHASE_COLLECTION);

	// Controlliamo se dobbiamo creare una sottofase
	if (parentId !== projectId) {
		const phaseOut = await findCollectionWrapper<Phase>(
			{ _id: parentId },
			phaseClient
		);

		if (phaseOut.status !== 200) {
			return phaseOut;
		}

		const phase: StringPhase[] = await phaseOut.json();

		// Controlliamo che la fase padre non sia già sottofase del progetto passato
		if (phase[0].parentId !== projectId) {
			return generateMessageResponse("Parent is already a subphase", 400);
		}

		// Controlliamo che il range di date sia incluso nel range della fase padre
		if (phase[0].dtStart > newBody.dtStart || phase[0].due < newBody.due) {
			return generateMessageResponse(
				"Date range is not included in parent range",
				400
			);
		}

		// Controlliamo che la fase padre non abbia giá delle activity
		const activitiesClient: Collection<Activity> =
			await getCollection<Activity>(ACTIVITY_COLLECTION);

		const activitiesOut = await findCollectionWrapper<Activity>(
			{ parentActivityId: parentId },
			activitiesClient
		);

		if (activitiesOut.status !== 404) {
			return generateMessageResponse("Parent phase has activities", 400);
		}
	}

	// Creiamo una nuova fase con quei campi
	const newPhase: StringPhase = generateStringModel<StringPhase>(
		{
			summary: newBody.summary,
			ownerId: userId,
			projectId: projectId,
			parentId: parentId,
			dtStart: new Date(newBody.dtStart).toISOString(),
			due: new Date(newBody.due).toISOString()
		},
		"Phase"
	);

	// Aggiungiamo il campo 'ownerId' alla fase
	newPhase.ownerId = userId;

	return await addCollectionWrapper(newPhase, phaseClient);
};
