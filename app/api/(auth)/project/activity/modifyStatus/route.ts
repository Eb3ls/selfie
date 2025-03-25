import {
	generateMessageResponse,
	generateObjectResponse,
	validate
} from "@/utils/api/api";
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
	status: "WAITING"
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

	// Estraiamo l'id dell'utente
	const userId: string = user._id!;

	// Estraiamo l'id dal body
	const activityId: string = newBody._id!;

	// Estriamo lo status dal body
	const newStatus: string = newBody.status;

	// Otteniamo la collezione delle attività
	const projectActivityClient: Collection<ProjectActivity> =
		await getCollection<ProjectActivity>(PROJECT_ACTIVITY_COLLECTION);

	const projectActivityOut = await findCollectionWrapper<ProjectActivity>(
		{ _id: activityId },
		projectActivityClient
	);

	if (projectActivityOut.status !== 200) {
		return projectActivityOut;
	}

	const projectActivity: StringProjectActivity = (
		await projectActivityOut.json()
	)[0];

	const activityStatus = projectActivity.status;
	const isOwner = userId === projectActivity.ownerId;
	const isUser = projectActivity.userIdList.includes(userId);

	// Verificiamo che l'utente sia l'owner o un membro dell'activity
	if (!isOwner && !isUser) {
		return generateMessageResponse("User not authorized", 400);
	}

	// Verifichiamo che l'activity non sia già stata completata o droppata
	if (activityStatus === "COMPLETED" && newStatus !== "DROPPED") {
		return generateMessageResponse("Activity already completed", 400);
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
					activityStatus !== "REACTIVATED" &&
					activityStatus !== "OVERDUE"
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

	const updateOut = await updateCollectionWrapper<ProjectActivity>(
		{ _id: activityId },
		{
			$set: {
				status: newStatus
			}
		} as any,
		projectActivityClient
	);

	if (updateOut.status !== 200) {
		return updateOut;
	}

	if (
		newStatus === "COMPLETED" ||
		(newStatus === "DROPPED" && projectActivity.nextIdList.length > 0)
	) {
		// Prendiamo tutte le activity
		const allActivitiesOut = await findCollectionWrapper<ProjectActivity>(
			{},
			projectActivityClient
		);

		if (allActivitiesOut.status !== 200) {
			return allActivitiesOut;
		}

		const allActivities: StringProjectActivity[] =
			await allActivitiesOut.json();

		// Prendiamo le attivitá successive
		const nextActivities = allActivities.filter((activity) =>
			projectActivity.nextIdList.includes(activity._id!)
		);

		// Per ogni attività successiva, controlliamo se tutte le attività precedenti sono completate
		for (const nextActivity of nextActivities) {
			const prevNextActivities = allActivities.filter((activity) =>
				activity.nextIdList.includes(nextActivity._id!)
			);
			let allCompleted = true;

			// Per ogni attività precedente linkata alla successiva
			for (const prevNextActivity of prevNextActivities) {
				if (
					prevNextActivity.status !== "COMPLETED" &&
					prevNextActivity.status !== "DROPPED"
				) {
					allCompleted = false;
					break;
				}
			}

			// Se tutte le attività precedenti sono completate, settiamo la successiva come attivabile
			if (allCompleted) {
				const updateOut =
					await updateCollectionWrapper<ProjectActivity>(
						{ _id: nextActivity._id },
						{ $set: { status: "ACTIVABLE" } } as any,
						projectActivityClient
					);

				if (updateOut.status !== 200) {
					return updateOut;
				}
			}
		}
	}

	const updatedActivity: StringProjectActivity = (await updateOut.json())[0];

	return generateObjectResponse(updatedActivity, 200);
};
