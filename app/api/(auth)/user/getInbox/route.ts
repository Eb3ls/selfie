import {
	generateMessageResponse,
	generateObjectResponse,
	validate
} from "@/utils/api/api";
import {
	ACTIVITY_COLLECTION,
	Activity,
	EVENT_COLLECTION,
	Event,
	INVITATION_COLLECTION,
	Invitation,
	NOTE_COLLECTION,
	Note,
	PROJECT_COLLECTION,
	Project,
	SESSION_COLLECTION,
	Session,
	StringInvitation,
	USER_COLLECTION,
	User,
	findCollectionWrapper,
	getCollection
} from "@/utils/db/db";
import { Collection } from "mongodb";
import { NextRequest } from "next/server";

type ApiResponse = {
	_id: string;
	username: string;
	type: "ACTIVITY" | "EVENT" | "SESSION" | "PROJECT" | "NOTE";
	targetSummary: string;
};

export const GET = async (request: NextRequest) => {
	// Validazione della richiesta
	const validation = await validate<{}>(request, {}, false);

	// Se la validazione fallisce, ritorna il messaggio di errore
	if (validation === null) {
		return generateMessageResponse("Invalid request", 400);
	}

	// Estraiamo l'utente e il corpo della richiesta
	const { user: user, body: newBody } = validation;

	// Estraggo l'id dell'utente
	const userId: string = user._id!;

	// Otteniamo la collezione degli inviti
	const invitationClient: Collection<Invitation> =
		await getCollection<Invitation>(INVITATION_COLLECTION);

	// Otteniamo tutti gli inviti che hanno come destinatario l'utente
	const outInvitation = await findCollectionWrapper<Invitation>(
		{
			userId: userId
		},
		invitationClient
	);

	if (outInvitation.status === 404) {
		// Se non ci sono inviti, ritorna un array vuoto
		return generateObjectResponse([], 200);
	}

	if (outInvitation.status !== 200) {
		// Se c'è stato un errore, ritorna un errore
		return outInvitation;
	}

	const invitationArray: StringInvitation[] = await outInvitation.json();

	// Otteniamo la collezione degli utenti
	const userClient: Collection<User> =
		await getCollection<User>(USER_COLLECTION);

	const response: ApiResponse[] = [];

	for (const invitation of invitationArray) {
		const { _id, type, targetId } = invitation;

		if (type === "ACTIVITY") {
			// Otteniamo la collezione delle attività
			const activityClient: Collection<Activity> =
				await getCollection<Activity>(ACTIVITY_COLLECTION);

			const activityOut = await findCollectionWrapper<Activity>(
				{
					_id: targetId
				},
				activityClient
			);

			if (activityOut.status !== 200) {
				return activityOut;
			}

			const activity = (await activityOut.json())[0];
			const { summary: targetSummary, ownerId: ownerId } = activity;

			// Otteniamo il nome dell'owner dell'attività
			const userOut = await findCollectionWrapper<User>(
				{
					_id: ownerId
				},
				userClient
			);

			if (userOut.status !== 200) {
				return userOut;
			}

			const user = (await userOut.json())[0];
			const username = user.username;

			response.push({
				_id: _id!,
				username,
				type,
				targetSummary
			});
		} else if (type === "EVENT") {
			// Otteniamo la collezione degli eventi
			const eventClient: Collection<Event> =
				await getCollection<Event>(EVENT_COLLECTION);

			const eventOut = await findCollectionWrapper<Event>(
				{
					_id: targetId
				},
				eventClient
			);

			if (eventOut.status !== 200) {
				return eventOut;
			}

			const event = (await eventOut.json())[0];
			const { summary: targetSummary, ownerId: ownerId } = event;

			// Otteniamo il nome dell'owner dell'evento
			const userOut = await findCollectionWrapper<User>(
				{
					_id: ownerId
				},
				userClient
			);

			if (userOut.status !== 200) {
				return userOut;
			}

			const user = (await userOut.json())[0];
			const username = user.username;

			response.push({
				_id: _id!,
				username,
				type,
				targetSummary
			});
		} else if (type === "SESSION") {
			// Otteniamo la collezione delle sessioni
			const sessionClient: Collection<Session> =
				await getCollection<Session>(SESSION_COLLECTION);

			const sessionOut = await findCollectionWrapper<Session>(
				{
					_id: targetId
				},
				sessionClient
			);

			if (sessionOut.status !== 200) {
				return sessionOut;
			}

			const session = (await sessionOut.json())[0];
			const { summary: targetSummary, ownerId: ownerId } = session;

			// Otteniamo il nome dell'owner della sessione
			const userOut = await findCollectionWrapper<User>(
				{
					_id: ownerId
				},
				userClient
			);

			if (userOut.status !== 200) {
				return userOut;
			}

			const user = (await userOut.json())[0];
			const username = user.username;

			response.push({
				_id: _id!,
				username,
				type,
				targetSummary
			});
		} else if (type === "PROJECT") {
			// Otteniamo la collezione dei progetti
			const projectClient: Collection<Project> =
				await getCollection<Project>(PROJECT_COLLECTION);

			const projectOut = await findCollectionWrapper<Project>(
				{
					_id: targetId
				},
				projectClient
			);

			if (projectOut.status !== 200) {
				return projectOut;
			}

			const project = (await projectOut.json())[0];
			const { summary: targetSummary, ownerId: ownerId } = project;

			// Otteniamo il nome dell'owner del progetto
			const userOut = await findCollectionWrapper<User>(
				{
					_id: ownerId
				},
				userClient
			);

			if (userOut.status !== 200) {
				return userOut;
			}

			const user = (await userOut.json())[0];
			const username = user.username;

			response.push({
				_id: _id!,
				username,
				type,
				targetSummary
			});
		} else if (type === "NOTE") {
			// Otteniamo la collezione delle note
			const noteClient: Collection<Note> =
				await getCollection<Note>(NOTE_COLLECTION);

			const noteOut = await findCollectionWrapper<Note>(
				{
					_id: targetId
				},
				noteClient
			);

			if (noteOut.status !== 200) {
				return noteOut;
			}

			const note = (await noteOut.json())[0];
			const { summary: targetSummary, ownerId: ownerId } = note;

			// Otteniamo il nome dell'owner della nota
			const userOut = await findCollectionWrapper<User>(
				{
					_id: ownerId
				},
				userClient
			);

			if (userOut.status !== 200) {
				return userOut;
			}

			const user = (await userOut.json())[0];
			const username = user.username;

			response.push({
				_id: _id!,
				username,
				type,
				targetSummary
			});
		} else {
			return generateMessageResponse("Tipo di invito non valido", 400);
		}
	}

	return generateObjectResponse(response, 200);
};
