import {
	generateMessageResponse,
	isTemplateValid,
	parseJSONInput
} from "@/utils/api/api";
import {
	USER_COLLECTION,
	User,
	findCollectionWrapper,
	getCollection
} from "@/utils/db/db";
import { login } from "@/utils/session/session";
import crypto from "crypto";
import { Collection } from "mongodb";
import { NextRequest } from "next/server";

const requestTemplate = {
	username: "",
	password: ""
};

type RequestType = typeof requestTemplate;

export const POST = async (request: NextRequest) => {
	// Convertiamo in JSON il body della richiesta
	const body: RequestType | undefined = await parseJSONInput(request);
	if (body === undefined) {
		return generateMessageResponse("Invalid input", 400);
	}

	// Controlliamo che il body abbia tutti i campi necessari
	if (!isTemplateValid(body, requestTemplate)) {
		return generateMessageResponse("Invalid input", 400);
	}

	const castedUser: RequestType = body as RequestType;

	const passwordEncrypted: string = crypto
		.createHash("sha256")
		.update(castedUser.password)
		.digest("hex");

	castedUser.password = passwordEncrypted;

	// Ottieniamo la collezione degli utenti
	const client: Collection<User> = await getCollection<User>(USER_COLLECTION);

	const userOut = await findCollectionWrapper<User>(
		{ username: castedUser.username },
		client
	);

	if (userOut.status !== 200) {
		return generateMessageResponse("User not found", 400);
	}

	const user: User = (await userOut.json())[0];

	// Se arriviamo qua significa che lo abbiamo trovato
	if (user.password !== castedUser.password) {
		return generateMessageResponse("Wrong password", 400);
	}

	const response = generateMessageResponse("User found", 200);

	// Impostiamo i cookie
	login(user._id!, user.username, passwordEncrypted, response.cookies);

	return response;
};
