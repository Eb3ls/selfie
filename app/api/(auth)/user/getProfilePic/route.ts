import { DEFAULT_PROFILE_PIC } from "@/app/constants";
import {
	generateMessageResponse,
	generateObjectResponse,
	validate
} from "@/utils/api/api";
import {
	USER_COLLECTION,
	User,
	findCollectionWrapper,
	getCollection
} from "@/utils/db/db";
import { NextRequest } from "next/server";

export const GET = async (request: NextRequest) => {
	const validation = await validate(request, {}, false);
	if (!validation) {
		return generateMessageResponse("Unauthorized", 401);
	}

	const { user } = validation;
	const userId = user._id;

	try {
		const client = await getCollection<User>(USER_COLLECTION);
		const userResult = await findCollectionWrapper({ _id: userId }, client);

		if (userResult.status !== 200) {
			return generateMessageResponse("User not found", 404);
		}

		const currentUser = (await userResult.json())[0] as User;
		const profilePic = currentUser.profilePic || DEFAULT_PROFILE_PIC;

		// Verifica se l'immagine esiste fisicamente
		if (profilePic !== DEFAULT_PROFILE_PIC) {
			const fs = require("fs");
			const path = require("path");
			const imagePath = path.join(process.cwd(), "public", profilePic);

			if (!fs.existsSync(imagePath)) {
				return generateObjectResponse(
					{ profilePic: DEFAULT_PROFILE_PIC },
					200
				);
			}
		}

		return generateObjectResponse({ profilePic }, 200);
	} catch (error) {
		console.error("Profile pic fetch error:", error);
		return generateMessageResponse("Internal server error", 500);
	}
};
