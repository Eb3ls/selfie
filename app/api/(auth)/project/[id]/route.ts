import {
	generateMessageResponse,
	generateObjectResponse,
	idListToNameList,
	validate
} from "@/utils/api/api";
import {
	Alarm,
	PHASE_COLLECTION,
	PROJECT_ACTIVITY_COLLECTION,
	PROJECT_COLLECTION,
	Phase,
	Project,
	ProjectActivity,
	StringProject,
	findCollectionWrapper,
	getCollection
} from "@/utils/db/db";
import { Collection, ObjectId } from "mongodb";
import { NextRequest } from "next/server";

interface ProjectResponse {
	_id: string;
	summary: string;
	owner: { id: string; name: string };
	users: { id: string; name: string }[];
	noteId: string;
	phases: PhaseResponse[];
}

interface PhaseResponse {
	_id: string;
	summary: string;
	owner: { id: string; name: string };
	dtStart: string;
	due: string;
	subPhases: SubPhaseResponse[];
	activities: ProjectActivityResponse[];
}

interface SubPhaseResponse {
	_id: string;
	summary: string;
	owner: { id: string; name: string };
	dtStart: string;
	due: string;
	activities: ProjectActivityResponse[];
}

interface Link {
	_id: string;
	summary: string;
	date: string;
	noteId: string;
}

interface ProjectActivityResponse {
	_id: string;
	summary: string;
	description: string;
	status: string;
	dtStart: string;
	due: string;
	isMilestone: boolean;
	owner: { id: string; name: string };
	users: { id: string; name: string }[];
	prevLinks: Link[];
	prevMaxDue: string;
	nextLinks: Link[];
	nextMinStart: string;
	alarms: Alarm[];
	noteId?: string;
}

export const GET = async (
	request: NextRequest,
	params: { params: { id: string } }
) => {
	// Validazione della richiesta
	const validation = await validate<{}>(request, {}, false);

	// Se la validazione fallisce, ritorna il messaggio di errore
	if (validation === null) {
		return generateMessageResponse("Invalid request", 400);
	}

	// Estraiamo l'utente e il corpo della richiesta
	const { user } = validation;

	// Estraiamo l'ID dell'utente
	const userId: string = user._id!;

	const projectId = params.params.id;

	if (!projectId) {
		return generateMessageResponse("Invalid request", 400);
	}

	// Otteniamo la collezione dei progetti
	const projectClient: Collection<Project> =
		await getCollection<Project>(PROJECT_COLLECTION);
	const outProject = await findCollectionWrapper<Project>(
		{ _id: projectId },
		projectClient
	);

	if (outProject.status !== 200) {
		return outProject;
	}

	const project: StringProject = (await outProject.json())[0];

	// Controlla che l'utente dei cookie sia l'owner del progetto
	if (
		project.ownerId.toString() !== userId &&
		!project.userIdList.includes(userId)
	) {
		return generateMessageResponse("Unauthorized", 401);
	}

	// Convertiamo ownerId in nome utente
	const ownerConversion = await idListToNameList([
		project.ownerId.toString()
	]);
	if (ownerConversion.status !== 200) {
		return generateMessageResponse("Error converting owner ID", 500);
	}

	const userConversion = await idListToNameList(
		project.userIdList.map((id) => id.toString())
	);
	if (userConversion.status !== 200) {
		return generateMessageResponse("Error converting user IDs", 500);
	}

	const projectResponse: ProjectResponse = {
		_id: project._id!.toString(),
		summary: project.summary,
		owner: {
			id: project.ownerId.toString(),
			name: ownerConversion.userNameList![0]
		},
		users: project.userIdList.map((id, index) => ({
			id: id.toString(),
			name: userConversion.userNameList![index]
		})),
		noteId: project.noteId.toString(),
		phases: []
	};

	// Otteniamo le fasi del progetto
	const phaseClient: Collection<Phase> =
		await getCollection<Phase>(PHASE_COLLECTION);
	const outPhases = await findCollectionWrapper<Phase>(
		{ projectId: projectId, parentId: projectId },
		phaseClient
	);

	// Otteniamo le attività delle sottofasi
	const activityClient: Collection<ProjectActivity> =
		await getCollection<ProjectActivity>(PROJECT_ACTIVITY_COLLECTION);

	// Mappa per tutte le attività
	const allActivitiesMap = new Map<string, ProjectActivityResponse>();

	if (outPhases.status === 200) {
		const phases: Phase[] = await outPhases.json();

		for (const phase of phases) {
			const phaseOwnerConversion = await idListToNameList([
				phase.ownerId.toString()
			]);

			if (phaseOwnerConversion.status !== 200) {
				return generateMessageResponse(
					"Error converting phase owner ID",
					500
				);
			}

			const phaseResponse: PhaseResponse = {
				_id: phase._id!.toString(),
				summary: phase.summary,
				owner: {
					id: phase.ownerId.toString(),
					name: phaseOwnerConversion.userNameList![0]
				},
				dtStart: new Date(phase.dtStart).toISOString(),
				due: new Date(phase.due).toISOString(),
				subPhases: [],
				activities: []
			};

			// Otteniamo le sottofasi
			const outSubPhases = await findCollectionWrapper<Phase>(
				{ parentId: phase._id!.toString() },
				phaseClient
			);
			if (outSubPhases.status === 200) {
				const subPhases: Phase[] = await outSubPhases.json();

				for (const subPhase of subPhases) {
					const subPhaseOwnerConversion = await idListToNameList([
						subPhase.ownerId.toString()
					]);
					if (subPhaseOwnerConversion.status !== 200) {
						return generateMessageResponse(
							"Error converting subphase owner ID",
							500
						);
					}

					const subPhaseResponse: SubPhaseResponse = {
						_id: subPhase._id!.toString(),
						summary: subPhase.summary,
						owner: {
							id: subPhase.ownerId.toString(),
							name: subPhaseOwnerConversion.userNameList![0]
						},
						dtStart: new Date(subPhase.dtStart).toISOString(),
						due: new Date(subPhase.due).toISOString(),
						activities: []
					};

					const outActivities =
						await findCollectionWrapper<ProjectActivity>(
							{ phaseId: subPhase._id!.toString() },
							activityClient
						);

					if (outActivities.status === 200) {
						const activities: ProjectActivity[] =
							await outActivities.json();

						for (const activity of activities) {
							const activityOwnerConversion =
								await idListToNameList([
									activity.ownerId.toString()
								]);
							if (activityOwnerConversion.status !== 200) {
								return generateMessageResponse(
									"Error converting activity owner ID",
									500
								);
							}

							const activityUsersConversion =
								await idListToNameList(
									activity.userIdList.map((id) =>
										id.toString()
									)
								);
							if (activityUsersConversion.status !== 200) {
								return generateMessageResponse(
									"Error converting activity user IDs",
									500
								);
							}

							const activityResponse: ProjectActivityResponse = {
								_id: activity._id!.toString(),
								summary: activity.summary,
								description: activity.description,
								status: activity.status,
								dtStart: new Date(
									activity.dtStart
								).toISOString(),
								due: new Date(activity.due).toISOString(),
								isMilestone: activity.isMilestone,
								owner: {
									id: activity.ownerId.toString(),
									name: activityOwnerConversion
										.userNameList![0]
								},
								users: activity.userIdList.map((id, index) => ({
									id: id.toString(),
									name: activityUsersConversion.userNameList![
										index
									]
								})),
								prevLinks:
									activity.prevIdList?.map((id) => ({
										_id: id.toString(),
										summary: "", // Temporaneo, verrà popolato dopo
										date: "", // Temporaneo, verrà popolato dopo
										noteId: ""
									})) || [],
								prevMaxDue: "",
								nextLinks:
									activity.nextIdList?.map((id) => ({
										_id: id.toString(),
										summary: "", // Temporaneo, verrà popolato dopo
										date: "", // Temporaneo, verrà popolato dopo
										noteId: ""
									})) || [],
								nextMinStart: "",
								alarms: activity.alarms,
								noteId: activity.noteId?.toString()
							};

							allActivitiesMap.set(
								activityResponse._id,
								activityResponse
							);
							subPhaseResponse.activities.push(activityResponse);
						}
					}

					phaseResponse.subPhases.push(subPhaseResponse);
				}
			}

			// Otteniamo le attività delle fasi principali
			const outPhaseActivities =
				await findCollectionWrapper<ProjectActivity>(
					{ phaseId: phase._id!.toString() },
					activityClient
				);
			if (outPhaseActivities.status === 200) {
				const activities: ProjectActivity[] =
					await outPhaseActivities.json();

				for (const activity of activities) {
					const activityOwnerConversion = await idListToNameList([
						activity.ownerId.toString()
					]);
					if (activityOwnerConversion.status !== 200) {
						return generateMessageResponse(
							"Error converting activity owner ID",
							500
						);
					}

					const activityUsersConversion = await idListToNameList(
						activity.userIdList.map((id) => id.toString())
					);
					if (activityUsersConversion.status !== 200) {
						return generateMessageResponse(
							"Error converting activity user IDs",
							500
						);
					}

					const activityResponse: ProjectActivityResponse = {
						_id: activity._id!.toString(),
						summary: activity.summary,
						description: activity.description,
						status: activity.status,
						dtStart: new Date(activity.dtStart).toISOString(),
						due: new Date(activity.due).toISOString(),
						isMilestone: activity.isMilestone,
						owner: {
							id: activity.ownerId.toString(),
							name: activityOwnerConversion.userNameList![0]
						},
						users: activity.userIdList.map((id, index) => ({
							id: id.toString(),
							name: activityUsersConversion.userNameList![index]
						})),
						prevLinks:
							activity.prevIdList?.map((id) => ({
								_id: id.toString(),
								summary: "", // Temporaneo, verrà popolato dopo
								date: "", // Temporaneo, verrà popolato dopo
								noteId: ""
							})) || [],
						prevMaxDue: "",
						nextLinks:
							activity.nextIdList?.map((id) => ({
								_id: id.toString(),
								summary: "", // Temporaneo, verrà popolato dopo
								date: "", // Temporaneo, verrà popolato dopo
								noteId: ""
							})) || [],
						nextMinStart: "",
						alarms: activity.alarms,
						noteId: activity.noteId?.toString()
					};

					allActivitiesMap.set(
						activityResponse._id,
						activityResponse
					);
					phaseResponse.activities.push(activityResponse);
				}
			}

			projectResponse.phases.push(phaseResponse);
		}

		// Seconda passata: popola i link
		for (const activity of allActivitiesMap.values()) {
			// Popola prevLinks
			activity.prevLinks = activity.prevLinks
				.map((link: any) => {
					const linkedActivity = allActivitiesMap.get(link._id);
					return linkedActivity
						? {
								_id: link._id,
								summary: linkedActivity.summary,
								date: linkedActivity.due,
								noteId: linkedActivity.noteId
							}
						: null;
				})
				.filter(Boolean) as Link[];

			// Popola nextLinks
			activity.nextLinks = activity.nextLinks
				.map((link: any) => {
					const linkedActivity = allActivitiesMap.get(link._id);
					return linkedActivity
						? {
								_id: link._id,
								summary: linkedActivity.summary,
								date: linkedActivity.dtStart,
								noteId: linkedActivity.noteId
							}
						: null;
				})
				.filter(Boolean) as Link[];

			// Calcola le date
			if (activity.prevLinks.length > 0) {
				activity.prevMaxDue = new Date(
					Math.max(
						...activity.prevLinks.map((l: any) =>
							new Date(l.date).getTime()
						)
					)
				).toISOString();
			} else {
				activity.prevMaxDue = "";
			}

			if (activity.nextLinks.length > 0) {
				activity.nextMinStart = new Date(
					Math.min(
						...activity.nextLinks.map((l: any) =>
							new Date(l.date).getTime()
						)
					)
				).toISOString();
			} else {
				activity.nextMinStart = "";
			}
		}

		// Ordina tutto
		const sortByStartDate = (
			a: { dtStart: string },
			b: { dtStart: string }
		) => new Date(a.dtStart).getTime() - new Date(b.dtStart).getTime();

		const sortByDueDate = (a: { due: string }, b: { due: string }) =>
			new Date(a.due).getTime() - new Date(b.due).getTime();

		// Ordina fasi
		projectResponse.phases.sort(sortByStartDate);

		// Ordina sottofasi e attività
		projectResponse.phases.forEach((phase) => {
			phase.subPhases.sort(sortByStartDate);
			phase.activities.sort(sortByDueDate);

			phase.subPhases.forEach((subPhase) => {
				subPhase.activities.sort(sortByDueDate);
			});
		});
	}

	return generateObjectResponse(projectResponse, 200);
};
