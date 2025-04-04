import {
	generateMessageResponse,
	generateObjectResponse,
	validate
} from "@/utils/api/api";
import {
	StringUser,
	USER_COLLECTION,
	User,
	findCollectionWrapper,
	getCollection
} from "@/utils/db/db";
import { Collection } from "mongodb";
import { NextRequest } from "next/server";

type Response = {
	id: string;
	name: string;
};

export const GET = async (request: NextRequest) => {
	// Validazione della richiesta
	const validation = await validate<{}>(request, {}, false);

	// Se la validazione fallisce, ritorna il messaggio di errore
	if (validation === null) {
		return generateMessageResponse("Invalid request", 400);
	}

	// Ottieniamo la collezione degli utenti
	const client: Collection<User> = await getCollection<User>(USER_COLLECTION);

	const out = await findCollectionWrapper<User>({}, client);

	if (out.status !== 200) {
		return out;
	}

	const usernameList: StringUser[] = await out.json();

	// Realizziamo un array di oggetti con id e nome
	const resources: Response[] = usernameList.map((user) => {
		return {
			id: user._id!,
			name: user.username
		};
	});

	// Filtriamo le risorse per rimuovere quelle che non hanno
	// un nome che inizia con "[RES]-"
	const response: Response[] = resources.filter((resource) => {
		return resource.name.startsWith("[RES]-");
	});

	// Ritorniamo la risposta
	return generateObjectResponse(response, 200);
};
