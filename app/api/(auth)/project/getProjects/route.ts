import {
	generateMessageResponse,
	generateObjectResponse,
	idListToNameList,
	validate
} from "@/utils/api/api";
import {
	PROJECT_COLLECTION,
	Project,
	findCollectionWrapper,
	getCollection
} from "@/utils/db/db";
import { Collection } from "mongodb";
import { NextRequest } from "next/server";

export interface ProjectResponse {
	_id?: string; // ID del progetto (stringa)
	summary: string; // Titolo del progetto
	ownerName: string; // Nome del proprietario
	userNameList: string[]; // Lista di nomi degli utenti
	noteId: string; // ID della nota associata (stringa)
}

export const GET = async (request: NextRequest) => {
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

	// Otteniamo la collezione dei progetti
	const projectClient: Collection<Project> =
		await getCollection<Project>(PROJECT_COLLECTION);

	// Otteniamo tutti i progetti associati all'utente
	const outProject = await findCollectionWrapper<Project>(
		{ userIdList: { $in: [userId] } } as any,
		projectClient
	);

	let projects: ProjectResponse[] = [];

	if (outProject.status === 500) {
		// Se c'è stato un errore, ritorna l'errore
		return outProject;
	} else if (outProject.status === 404) {
		// Se non ci sono progetti, restituiamo un array vuoto
		projects = [];
	} else {
		// Otteniamo i progetti trovati
		const projectList = await outProject.json();

		// Iteriamo sui progetti per convertire gli ID in nomi utente
		for (let i = 0; i < projectList.length; i++) {
			const project = projectList[i];

			// Verifica che la lista userIdList esista nel progetto
			if (!project.userIdList || !Array.isArray(project.userIdList)) {
				return generateMessageResponse(
					`Invalid or missing userIdList in project at index ${i}`,
					400
				);
			}

			// Convertiamo ownerId in nome utente
			const ownerConversion = await idListToNameList([
				project.ownerId.toString()
			]);

			if (ownerConversion.status !== 200) {
				// Gestione degli errori nella conversione dell'ownerId
				return generateMessageResponse(
					ownerConversion.error ||
						`Error while converting owner ID for project at index ${i}`,
					ownerConversion.status
				);
			}

			// Convertiamo userIdList in lista di nomi utente
			const idConversionResult = await idListToNameList(
				project.userIdList.map((id: any) => id.toString())
			);

			if (idConversionResult.status !== 200) {
				// Gestione degli errori nella conversione
				return generateMessageResponse(
					idConversionResult.error ||
						`Error while converting user IDs for project at index ${i}`,
					idConversionResult.status
				);
			}

			// Costruiamo l'oggetto Projects
			projects.push({
				_id: project._id?.toString(),
				summary: project.summary,
				ownerName: ownerConversion.userNameList![0], // Il proprietario è un singolo utente
				userNameList: idConversionResult.userNameList!,
				noteId: project.noteId.toString()
			});
		}
	}

	// Restituiamo l'elenco dei progetti aggiornati
	return generateObjectResponse(projects, 200);
};
