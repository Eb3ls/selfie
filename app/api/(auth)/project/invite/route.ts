import {
	addInvitations,
	generateMessageResponse,
	usernameListToIds,
	validate
} from "@/utils/api/api";
import {
	PROJECT_COLLECTION,
	Project,
	StringProject,
	findCollectionWrapper,
	getCollection
} from "@/utils/db/db";
import { Collection } from "mongodb";
import { NextRequest } from "next/server";

const requestTemplate = {
	projectId: "",
	usernameList: []
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

	// Estraiamo l'id dal body
	const projectId: string = newBody.projectId!;

	// Estraiamo la lista degli username dal body
	const usernameList: string[] = newBody.usernameList;

	const convertionOut = await usernameListToIds(usernameList, userId, false);

	if (convertionOut.status !== 200) {
		return convertionOut;
	}

	// Otteniamo la lista degli id degli utenti
	const userIdList: string[] = (await convertionOut.json()).users;

	// Otteniamo la collezione dei progetti
	const projectClient: Collection<Project> =
		await getCollection<Project>(PROJECT_COLLECTION);

	// Otteniamo il progetto
	const projectOut = await findCollectionWrapper<Project>(
		{ _id: projectId },
		projectClient
	);

	if (projectOut.status !== 200) {
		return projectOut;
	}

	const project: StringProject = (await projectOut.json())[0];

	// Controlliamo che l'owner sia l'utente corrispondente
	if (project.ownerId !== userId) {
		return generateMessageResponse("Unauthorized", 400);
	}

	// Rimuoviamo dalla lista degli id quelli già presenti
	const usersToBeInvited: string[] = userIdList.filter(
		(userId) => !project.userIdList.includes(userId)
	);

	// Invitiamo gli utenti
	const inviteOut = await addInvitations(
		usersToBeInvited,
		"PROJECT",
		project._id!
	);

	return inviteOut;
};
