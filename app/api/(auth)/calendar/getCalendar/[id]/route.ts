import {
	generateMessageResponse,
	generateObjectResponse,
	idListToNameList,
	validate
} from "@/utils/api/api";
import {
	EVENT_COLLECTION,
	Event,
	StringEvent,
	StringUser,
	USER_COLLECTION,
	User,
	findCollectionWrapper,
	getCollection
} from "@/utils/db/db";
import { Collection, ObjectId } from "mongodb";
import { NextRequest } from "next/server";

type StringEventFrontend = Omit<StringEvent, "userIdList"> & {
	usernameList: string[];
};

interface CalendarResponse {
	events: StringEventFrontend[];
}

export const GET = async (
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) => {
	// Validazione della richiesta
	const validation = await validate<{}>(request, {}, false);

	// Se la validazione fallisce, ritorna il messaggio di errore
	if (validation === null) {
		return generateMessageResponse("Invalid request", 400);
	}
	const { id } = await params;

	// Otteniamo l'ID della risorsa dall'URL
	if (!ObjectId.isValid(id)) {
		return generateMessageResponse("Invalid resource ID", 400);
	}
	const resourceId: string = id;

	// Only resource calendars listed by getResources are shared with all users.
	const resourceOut = await findCollectionWrapper<User>(
		{ _id: resourceId },
		await getCollection<User>(USER_COLLECTION)
	);
	if (resourceOut.status !== 200) {
		return resourceOut;
	}
	const resource: StringUser = (await resourceOut.json())[0];
	if (!resource.username.startsWith("[RES]-")) {
		return generateMessageResponse("Not a resource calendar", 403);
	}

	// Otteniamo la collezione degli eventi
	const eventClient: Collection<Event> =
		await getCollection<Event>(EVENT_COLLECTION);

	// Otteniamo tutti gli eventi dell'utente
	const outEvent = await findCollectionWrapper<Event>(
		{ userIdList: { $in: [resourceId] } as any },
		eventClient
	);

	let events: StringEvent[];

	if (outEvent.status === 500) {
		// Se c'è stato un errore, ritorna un errore
		return outEvent;
	} else if (outEvent.status === 404) {
		events = [];
	} else {
		events = await outEvent.json();
	}

	let eventsFrontend: StringEventFrontend[] = [];

	// Per ogni evento, convertiamo la userIdList in un array di username
	for (const event of events) {
		const outNameList = await idListToNameList(event.userIdList);

		if (outNameList.status !== 200) {
			return generateMessageResponse(
				"Errore nel recupero del nome",
				outNameList.status
			);
		}

		const { userIdList: _, ...smallEvent } = event;

		eventsFrontend.push({
			...smallEvent,
			usernameList: outNameList.userNameList!
		});
	}

	const response: CalendarResponse = {
		events: eventsFrontend
	};

	return generateObjectResponse(response, 200);
};
