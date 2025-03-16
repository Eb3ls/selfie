// app/api/user/setProfilePic/route.ts
import { DEFAULT_PROFILE_PIC } from "@/app/constants";
import {
	generateMessageResponse,
	generateObjectResponse
} from "@/utils/api/api";
import {
	USER_COLLECTION,
	User,
	findCollectionWrapper,
	getCollection,
	updateCollectionWrapper
} from "@/utils/db/db";
import { decrypt } from "@/utils/session/session";
import fs from "fs";
import { NextRequest } from "next/server";
import path from "path";

// Assicurati che questa funzione esista

export const POST = async (request: NextRequest) => {
	try {
		// Estrazione sessione dai cookie
		const session = await getSession(request.cookies);

		if (
			!session?.user ||
			typeof session.user !== "object" ||
			!("_id" in session.user)
		) {
			return generateMessageResponse("Unauthorized", 401);
		}

		const userId = session.user._id as string;

		// Configurazione cartella upload
		const uploadDir = path.join(process.cwd(), "public", "profilePics");
		if (!fs.existsSync(uploadDir)) {
			fs.mkdirSync(uploadDir, { recursive: true });
		}

		// Processamento file
		const formData = await request.formData();
		const file = formData.get("profilePic");

		if (!(file instanceof File)) {
			return generateMessageResponse("Nessun file fornito", 400);
		}

		// Verifiche sul file
		const buffer = await file.arrayBuffer();

		if (buffer.byteLength > 5 * 1024 * 1024) {
			return generateMessageResponse("L'immagine supera i 5MB", 400);
		}

		if (!file.type.startsWith("image/")) {
			return generateMessageResponse("Formato file non supportato", 400);
		}

		// Salvataggio file
		const timestamp = Date.now();
		const fileExtension = file.name.split(".").pop() || "jpg";
		const newFilename = `${userId}_${timestamp}.${fileExtension}`;
		const newFilePath = path.join(uploadDir, newFilename);

		fs.writeFileSync(newFilePath, new Uint8Array(buffer));

		// Recupero utente
		const client = await getCollection<User>(USER_COLLECTION);
		const userResult = await findCollectionWrapper(
			{ _id: userId as string },
			client
		);

		if (userResult.status !== 200) {
			fs.unlinkSync(newFilePath);
			return generateMessageResponse("Utente non trovato", 404);
		}

		// Eliminazione vecchia immagine
		const currentUser = (await userResult.json())[0] as User;
		if (
			currentUser.profilePic &&
			currentUser.profilePic !== DEFAULT_PROFILE_PIC
		) {
			const oldPath = path.join(
				process.cwd(),
				"public",
				currentUser.profilePic
			);

			if (fs.existsSync(oldPath)) {
				fs.unlinkSync(oldPath);
			}
		}

		// Aggiornamento database
		const newProfilePicPath = `/profilePics/${newFilename}`;

		const updateResult = await updateCollectionWrapper(
			{ _id: userId },
			{ $set: { profilePic: newProfilePicPath } } as any,
			client
		);

		if (updateResult.status !== 200) {
			fs.unlinkSync(newFilePath);
			return updateResult;
		}

		return generateObjectResponse({ profilePic: newProfilePicPath }, 200);
	} catch (error) {
		console.error("[BACKEND] Errore completo:", error);
		if (error instanceof Error) {
			console.error("[BACKEND] Dettaglio errore:", error.message);
		}
		return generateMessageResponse("Errore interno del server", 500);
	}
};

// Funzioni helper per la gestione della sessione
const getSession = async (cookies: any) => {
	const session = cookies.get("session")?.value;
	if (!session) return null;
	return await decrypt(session);
};

export const config = {
	api: {
		bodyParser: false
	}
};
