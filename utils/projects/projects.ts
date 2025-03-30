import { generateMessageResponse } from "@/utils/api/common";
import {
	Note,
	PHASE_COLLECTION,
	PROJECT_ACTIVITY_COLLECTION,
	Phase,
	ProjectActivity,
	StringPhase,
	StringProjectActivity,
	deleteCollectionWrapper,
	findCollectionWrapper,
	getCollection,
	updateCollectionWrapper
} from "@/utils/db/db";
import { timeMachine } from "@/utils/timeMachine/timeMachine";
import { Collection } from "mongodb";
import { NextResponse } from "next/server";

export async function detachProjectActivity(
	projectActivity: StringProjectActivity,
	projectActivityClient: Collection<ProjectActivity>
): Promise<NextResponse> {
	// Otteniamo l'id dell'attività
	const activityId = projectActivity._id;

	// Rimuoviamo l'attività dai nextIdList delle attività precedenti
	const prevIdList = projectActivity.prevIdList;
	for (const prevId of prevIdList) {
		const prevActivityOut = await findCollectionWrapper<ProjectActivity>(
			{ _id: prevId },
			projectActivityClient
		);

		if (prevActivityOut.status !== 200) {
			return prevActivityOut;
		}

		const prevActivity: StringProjectActivity[] =
			await prevActivityOut.json();

		const prevNextIdList = prevActivity[0].nextIdList.filter(
			(prevNextId) => prevNextId !== activityId
		);

		const updateOut = await updateCollectionWrapper<ProjectActivity>(
			{ _id: prevId },
			{ $set: { nextIdList: prevNextIdList } } as any,
			projectActivityClient
		);

		if (updateOut.status !== 200) {
			return updateOut;
		}
	}

	const nextIdList = projectActivity.nextIdList;

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

		if (updateOut.status !== 200) {
			return updateOut;
		}
	}

	// Rimuoviamo prevIdList e nextIdList dall'attività
	const updateOut = await updateCollectionWrapper<ProjectActivity>(
		{ _id: activityId },
		{
			$set: {
				prevIdList: [],
				nextIdList: []
			}
		} as any,
		projectActivityClient
	);
	return updateOut;
}

export async function deleteProjectActivity(
	projectActivity: StringProjectActivity,
	projectActivityClient: Collection<ProjectActivity>,
	noteClient: Collection<Note>
): Promise<Response> {
	// Otteniamo l'id dell'attività
	const activityId = projectActivity._id;

	const noteOut = await deleteCollectionWrapper<Note>(
		{ _id: projectActivity.noteId },
		noteClient
	);

	const detachedOut = await detachProjectActivity(
		projectActivity,
		projectActivityClient
	);

	if (detachedOut.status !== 200) {
		return detachedOut;
	}

	if (noteOut.status !== 200) {
		return noteOut;
	}

	// Eliminiamo l'attività
	return await deleteCollectionWrapper<ProjectActivity>(
		{ _id: activityId },
		projectActivityClient
	);
}

export async function deletePhase(
	phase: StringPhase,
	phaseClient: Collection<Phase>,
	activityClient: Collection<ProjectActivity>,
	noteClient: Collection<Note>
): Promise<Response> {
	const phaseId = phase._id;
	// Otteniamo le sottofasi
	const subPhasesOut = await findCollectionWrapper<Phase>(
		{ parentId: phaseId },
		phaseClient
	);

	// Se ci sono sottofasi, le cancelliamo
	if (subPhasesOut.status === 200) {
		const subPhases: StringPhase[] = await subPhasesOut.json();
		// Eliminiamo le sottofasi
		while (subPhases.length > 0) {
			const subPhase = subPhases.shift()!;
			const subPhaseOut = await deletePhase(
				subPhase,
				phaseClient,
				activityClient,
				noteClient
			);
			if (subPhaseOut.status !== 200) {
				return subPhaseOut;
			}
		}
	} else if (subPhasesOut.status === 404) {
		// Otteniamo le attività associate alla fase
		const activitiesOut = await findCollectionWrapper<ProjectActivity>(
			{ phaseId: phaseId },
			activityClient
		);

		if (activitiesOut.status === 200) {
			const activities: StringProjectActivity[] =
				await activitiesOut.json();

			// Eliminiamo le attività associate alla fase
			for (const activity of activities) {
				const activityOut = await deleteProjectActivity(
					activity,
					activityClient,
					noteClient
				);

				if (activityOut.status !== 200) {
					return activityOut;
				}
			}
		} else if (activitiesOut.status !== 404) {
			return activitiesOut;
		}
	} else if (subPhasesOut.status === 500) {
		return subPhasesOut;
	}

	// Eliminiamo la fase
	return await deleteCollectionWrapper<Phase>({ _id: phaseId }, phaseClient);
}

async function checkAndUpdatePhase(
	phaseId: string,
	newDue: Date,
	phaseClient: Collection<Phase>
): Promise<NextResponse> {
	// Prendiamo la fase padre
	const parentPhaseOut = await findCollectionWrapper<Phase>(
		{ _id: phaseId },
		phaseClient
	);

	if (parentPhaseOut.status !== 200) {
		return parentPhaseOut;
	}

	const phase: StringPhase = (await parentPhaseOut.json())[0];

	// Controlliamo se la fase contiene la sottofase
	if (new Date(phase.due) < newDue) {
		// Se la fase padre ha una data di scadenza maggiore della sottophase, aggiorniamo la data di scadenza della fase padre
		await updateCollectionWrapper<Phase>(
			{ _id: phase._id },
			{ $set: { due: newDue.toISOString() } } as any,
			phaseClient
		);

		// Controlliamo se la fase padre è una sottofase
		if (phase.parentId !== phase.projectId) {
			return checkAndUpdatePhase(phase.parentId, newDue, phaseClient);
		}
	}

	return generateMessageResponse("Phase updated", 200);
}

export async function dropProjectActivity(
	activity: StringProjectActivity,
	client: Collection<ProjectActivity>
): Promise<NextResponse> {
	const detachedOut = await detachProjectActivity(activity, client);

	if (detachedOut.status !== 200) {
		return detachedOut;
	}

	const updateOut = await updateCollectionWrapper<ProjectActivity>(
		{ _id: activity._id },
		{ $set: { status: "DROPPED" } } as any,
		client
	);

	return updateOut;
}

async function updateNextActivitiesDates(
	activity: StringProjectActivity,
	today: Date,
	projectActivityClient: Collection<ProjectActivity>,
	phaseClient: Collection<Phase>
): Promise<NextResponse> {
	// La scolleghiamo dalle attività precedenti e successive e la impostiamo a dropped
	if (activity.isMilestone) {
		const dropProjectActivityOut = await dropProjectActivity(
			activity,
			projectActivityClient
		);

		if (dropProjectActivityOut.status !== 200) {
			return dropProjectActivityOut;
		}
	} else {
		// Controlliamo le attività successive
		for (const nextActivityId of activity.nextIdList) {
			const nextActivityOut =
				await findCollectionWrapper<ProjectActivity>(
					{ _id: nextActivityId },
					projectActivityClient
				);
			if (nextActivityOut.status !== 200) {
				return nextActivityOut;
			}

			const nextActivity: StringProjectActivity = (
				await nextActivityOut.json()
			)[0];
			// Se doveva iniziare oggi la spostiamo a domani
			const tomorrow = new Date(today);
			tomorrow.setDate(tomorrow.getDate() + 1);

			if (new Date(nextActivity.dtStart) > today) {
				// Se l'inizio dell'attività successiva è maggiore di oggi, non facciamo nulla
				continue;
			}

			if (nextActivity.isMilestone) {
				// Se doveva ANCHE finire oggi la droppiamo
				if (new Date(nextActivity.due) <= tomorrow) {
					const dropProjectActivityOut = await dropProjectActivity(
						nextActivity,
						projectActivityClient
					);

					if (dropProjectActivityOut.status !== 200) {
						return dropProjectActivityOut;
					}
				} else {
					// Altrimenti spostiamo solo l'inizio a domani
					const updateOut =
						await updateCollectionWrapper<ProjectActivity>(
							{ _id: nextActivity._id },
							{
								$set: {
									dtStart: tomorrow.toISOString()
								}
							} as any,
							projectActivityClient
						);
					if (updateOut.status !== 200) {
						return updateOut;
					}
					// Aggiorniamo le fasi in cui é contenuta nel caso
					const checkOut = await checkAndUpdatePhase(
						nextActivity.phaseId,
						tomorrow,
						phaseClient
					);

					if (checkOut.status !== 200) {
						return checkOut;
					}
				}
			} else {
				// Aumentiamo il due per mantenere il range
				const newDue = new Date(nextActivity.due);
				newDue.setDate(newDue.getDate() + 1);

				// Aggiorniamo il dtStart e il due
				const updateOut =
					await updateCollectionWrapper<ProjectActivity>(
						{ _id: nextActivity._id },
						{
							$set: {
								dtStart: tomorrow.toISOString(),
								due: newDue.toISOString()
							}
						} as any,
						projectActivityClient
					);
				if (updateOut.status !== 200) {
					return updateOut;
				}
				// Aggiorniamo le fasi in cui é contenuta nel caso
				const checkOut = await checkAndUpdatePhase(
					nextActivity.phaseId,
					newDue,
					phaseClient
				);

				if (checkOut.status !== 200) {
					return checkOut;
				}

				// Modifichiamo il due per essere l'inizio del giorno
				newDue.setHours(2, 0, 0, 0);

				// Spostando il due richiamiamo la funzione per controllare se le attività successive sono tutte completate
				const nextUpdateOut = await updateNextActivitiesDates(
					nextActivity,
					newDue,
					projectActivityClient,
					phaseClient
				);

				if (nextUpdateOut.status !== 200) {
					return nextUpdateOut;
				}
			}
		}
	}
	return generateMessageResponse("Next activities dates updated", 200);
}

export async function handleOverdues() {
	// Otteniamo la collezione delle project activities
	const projectActivityClient: Collection<ProjectActivity> =
		await getCollection<ProjectActivity>(PROJECT_ACTIVITY_COLLECTION);

	// Otteniamo la collezione delle fasi
	const phaseClient: Collection<Phase> =
		await getCollection<Phase>(PHASE_COLLECTION);

	// Prendiamo tutte le project activities
	const allActivitiesOut = await findCollectionWrapper<ProjectActivity>(
		{},
		projectActivityClient
	);

	if (allActivitiesOut.status !== 200) {
		return allActivitiesOut;
	}

	const allActivities: StringProjectActivity[] =
		await allActivitiesOut.json();

	const today = timeMachine.timeMachineTime;
	// Prendiamo il timestamp di oggi a mezzanotte
	// Creare nuovo valore perché é per riferimento
	console.log("today ", today.toISOString());
	today.setHours(2, 0, 0, 0);
	console.log("today ", today.toISOString());
	today.setDate(today.getDate() + 1);
	console.log("tomorrow ", today.toISOString());

	// Filtriamo le attività scadute
	const overdueActivities = allActivities.filter((activity) => {
		return (
			new Date(activity.due) <= today &&
			activity.status !== "COMPLETED" &&
			activity.status !== "DROPPED"
		);
	});

	for (const activity of overdueActivities) {
		// Se non é una milestone dobbiamo aggiornare solo il due, dentro ad updateNextActivitiesDates
		// modificheremo anche il dtStart
		if (!activity.isMilestone) {
			const newDue = new Date(activity.due);
			newDue.setDate(newDue.getDate() + 1);
			const updateOut = await updateCollectionWrapper<ProjectActivity>(
				{ _id: activity._id },
				{
					$set: {
						due: today.toISOString()
					}
				} as any,
				projectActivityClient
			);
			if (updateOut.status !== 200) {
				return updateOut;
			}
			// Aggiorniamo le fasi in cui é contenuta nel caso
			const checkOut = await checkAndUpdatePhase(
				activity.phaseId,
				newDue,
				phaseClient
			);

			if (checkOut.status !== 200) {
				return checkOut;
			}
		}

		const updateNextActivitiesDatesOut = await updateNextActivitiesDates(
			activity,
			today,
			projectActivityClient,
			phaseClient
		);

		if (updateNextActivitiesDatesOut.status !== 200) {
			return updateNextActivitiesDatesOut;
		}

		// Se l´attivitá non é giá in overdue la impostiamo a overdue
		if (!activity.isOverdue && !activity.isMilestone) {
			const updateOut = await updateCollectionWrapper<ProjectActivity>(
				{ _id: activity._id },
				{ $set: { isOverdue: true } } as any,
				projectActivityClient
			);

			if (updateOut.status !== 200) {
				return updateOut;
			}
		}
	}

	return generateMessageResponse("Overdue activities updated", 200);
}
