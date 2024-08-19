import { NextRequest } from "next/server";
import { Collection, ObjectId } from "mongodb";
import {
	getCollection,
	PROJECT_ACTIVITY_COLLECTION,
} from "@/db_utils/db_functions";
import {
	findCollectionWrapper,
	updateOneCollectionWrapper,
} from "@/db_utils/db_wrappers";
import { ProjectActivity } from "@/db_utils/models/ProjectActivity";
import {
	generateMessageResponse,
	standardValidation,
} from "@/api_utils/api_functions";

const requestTemplate: Partial<ProjectActivity> = {
	_id: new ObjectId(),
	status: "WAITING",
};

export const PATCH = async (request: NextRequest) => {
	// Validazione standard
	const validation = await standardValidation<ProjectActivity>(
		request,
		requestTemplate,
		true
	);

	// Se la validazione fallisce, ritorna il messaggio di errore
	if (validation === null) {
		return generateMessageResponse("Invalid request", 400);
	}

	// Estraiamo l'utente e il corpo della richiesta
	const { user: user, body: body } = validation;

	// Estraiamo il senderId
	const senderId: ObjectId = user._id!;
	// Estraiamo l'id dell'attività
	const { _id, status: newStatus } = body;

	// Otteniamo la collezione delle attività
	const projectActivityClient: Collection<ProjectActivity> =
		await getCollection<ProjectActivity>(PROJECT_ACTIVITY_COLLECTION);

	const projectActivityOut = await findCollectionWrapper<ProjectActivity>(
		{ _id: _id },
		projectActivityClient
	);

	// Se l'attività non esiste, ritorna un errore
	if (projectActivityOut.status !== 200) {
		return projectActivityOut;
	}

	// Estraiamo i dati dell'attività
	const projectActivityData: ProjectActivity = (
		await projectActivityOut.json()
	)[0];

	const activityStatus = projectActivityData.status;

	// Verifichiamo che l'activity non sia già stata completata
	if (activityStatus === "COMPLETED") {
		return generateMessageResponse("Activity already completed", 400);
	}

	const isOwner = senderId.equals(projectActivityData.ownerId);
	const isUser = projectActivityData.userIdList.find((user) =>
		senderId.equals(user)
	);

	// Verificiamo che l'utente sia l'owner o un membro dell'activity
	if (!isOwner && !isUser) {
		return generateMessageResponse("User not authorized", 400);
	}

	let invalidUserStatus = false;

	if (isUser) {
		switch (newStatus) {
			case "ACTIVE":
				if (activityStatus !== "ACTIVABLE") {
					return generateMessageResponse(
						"Status should be activable",
						400
					);
				}
				break;
			case "SUBMITTED":
				if (
					activityStatus !== "ACTIVE" &&
					activityStatus !== "REACTIVATED"
				) {
					return generateMessageResponse(
						"Status should be active or reactivated",
						400
					);
				}
				break;
			case "DROPPED":
				if (
					activityStatus !== "WAITING" &&
					activityStatus !== "ACTIVABLE" &&
					activityStatus !== "ACTIVE" &&
					activityStatus !== "REACTIVATED"
				) {
					return generateMessageResponse(
						"Status should be waiting, activable, active or reactivated",
						400
					);
				}
				break;
			default:
				if (!isOwner) {
					return generateMessageResponse("Invalid status", 400);
				}
				invalidUserStatus = true;
				break;
		}
	}
	if (isOwner) {
		switch (newStatus) {
			case "COMPLETED":
				if (activityStatus !== "SUBMITTED") {
					return generateMessageResponse(
						"Status should be submitted",
						400
					);
				}
				break;
			case "REACTIVATED":
				if (activityStatus !== "SUBMITTED") {
					return generateMessageResponse(
						"Status should be submitted",
						400
					);
				}
				break;
			default:
				if (invalidUserStatus) {
					return generateMessageResponse("Invalid status", 400);
				}
				break;
		}
	}

	const updateOut = await updateOneCollectionWrapper<ProjectActivity>(
		_id!,
		{ status: newStatus } as ProjectActivity,
		projectActivityClient
	);

	if (updateOut.status !== 200) {
		return updateOut;
	}

	if (newStatus === "COMPLETED") {
		// Prendiamo la lista delle attività successive linkate
		const nextActivitiesOut = await findCollectionWrapper<ProjectActivity>(
			{ prevIdList: _id },
			projectActivityClient
		);

		if (nextActivitiesOut.status === 500) {
			return nextActivitiesOut;
		}

		if (nextActivitiesOut.status === 200) {
			const nextActivitiesData: ProjectActivity[] =
				await nextActivitiesOut.json();

			// Per ogni attività successiva, controlliamo se tutte le attività precedenti sono completate
			for (const nextActivity of nextActivitiesData) {
				const prevNextIds: ObjectId[] = nextActivity.prevIdList;
				let allCompleted = true;

				// Per ogni attività precedente linkata alla successiva
				for (const prevNextId of prevNextIds) {
					const prevNextActivityOut =
						await findCollectionWrapper<ProjectActivity>(
							{ _id: new ObjectId(prevNextId) },
							projectActivityClient
						);

					if (prevNextActivityOut.status !== 200) {
						return prevNextActivityOut;
					}

					// Controlliamo che l'attività precedente sia completata
					const prevNextActivityData =
						await prevNextActivityOut.json();
					if (prevNextActivityData[0].status !== "COMPLETED") {
						allCompleted = false;
						break;
					}
				}

				// Se tutte le attività precedenti sono completate, settiamo la successiva come attivabile
				if (allCompleted) {
					const updateOut =
						await updateOneCollectionWrapper<ProjectActivity>(
							new ObjectId(nextActivity._id!),
							{ status: "ACTIVABLE" } as ProjectActivity,
							projectActivityClient
						);

					if (updateOut.status !== 200) {
						return updateOut;
					}
				}
			}
		}
	}

	return updateOut;
};
