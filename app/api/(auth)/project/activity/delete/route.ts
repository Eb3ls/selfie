import { generateMessageResponse, validate } from "@/utils/api/api";
import {
	NOTE_COLLECTION,
	Note,
	PROJECT_ACTIVITY_COLLECTION,
	ProjectActivity,
	StringProjectActivity,
	deleteCollectionWrapper,
	findCollectionWrapper,
	getCollection,
	updateCollectionWrapper
} from "@/utils/db/db";
import { Collection } from "mongodb";
import { NextRequest } from "next/server";

const requestTemplate = {
	_id: ""
};

type RequestType = typeof requestTemplate;

export const DELETE = async (request: NextRequest) => {
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

	const projectActivity: StringProjectActivity[] =
		await projectActivityOut.json();

	// Controlliamo che l'owner sia l'utente corrispondente
	if (projectActivity[0].ownerId !== userId) {
		return generateMessageResponse("Unauthorized", 400);
	}

	// Rimuoviamo l'attività dai nextIdList delle attività precedenti
	const prevIdList = projectActivity[0].prevIdList;
	for (const prevId of prevIdList) {
		const prevActivityOut = await updateCollectionWrapper<ProjectActivity>(
			{ _id: prevId },
			{ $pull: { nextIdList: activityId } } as any,
			projectActivityClient
		);

		if (prevActivityOut.status !== 200) {
			return prevActivityOut;
		}
	}

	const nextIdList = projectActivity[0].nextIdList;

	// Rimuoviamo l'attività dai prevIdList delle attività successive
	for (const nextId of nextIdList) {
		const nextActivityOut = await findCollectionWrapper<ProjectActivity>(
			{ _id: nextId },
			projectActivityClient
		);

		if (nextActivityOut.status !== 200) {
			return nextActivityOut;
		}

		const nextActivity: StringProjectActivity[] =
			await nextActivityOut.json();

		const nextPrevIdList = nextActivity[0].prevIdList.filter(
			(nextPrevId) => nextPrevId !== activityId
		);

		if (nextActivity[0].status === "WAITING") {
			// Controlliamo se le attività successive hanno tutti i prevIdList a COMPLETED
			let allCompleted = true;

			for (const nextPrevId of nextPrevIdList) {
				const nextPrevActivityOut =
					await findCollectionWrapper<ProjectActivity>(
						{ _id: nextPrevId },
						projectActivityClient
					);

				if (nextPrevActivityOut.status !== 200) {
					return nextPrevActivityOut;
				}

				const nextPrevActivity: StringProjectActivity[] =
					await nextPrevActivityOut.json();

				if (nextPrevActivity[0].status !== "COMPLETED") {
					allCompleted = false;
					break;
				}
			}

			if (allCompleted) {
				// Se tutte le attività precedenti sono completate, settiamo lo stato a ACTIVABLE
				const nextActivityOut =
					await updateCollectionWrapper<ProjectActivity>(
						{ _id: nextId },
						{ $set: { status: "ACTIVABLE" } } as any,
						projectActivityClient
					);

				if (nextActivityOut.status !== 200) {
					return nextActivityOut;
				}
			}
		}

		// Rimuoviamo l'attività dai prevIdList delle attività successive
		const updateOut = await updateCollectionWrapper<ProjectActivity>(
			{ _id: nextId },
			{ $pull: { prevIdList: activityId } } as any,
			projectActivityClient
		);
	}

	// Otteniamo la collezione delle note
	const noteClient: Collection<Note> =
		await getCollection<Note>(NOTE_COLLECTION);

	const noteOut = await deleteCollectionWrapper<Note>(
		{ _id: projectActivity[0].noteId },
		noteClient
	);

	if (noteOut.status !== 200) {
		return noteOut;
	}

	// Eliminiamo l'attività
	return await deleteCollectionWrapper<ProjectActivity>(
		{ _id: activityId },
		projectActivityClient
	);
};
