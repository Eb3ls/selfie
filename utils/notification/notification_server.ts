import {
	StringUser,
	USER_COLLECTION,
	User,
	findCollectionWrapper,
	getCollection
} from "@/utils/db/db";
import { Collection } from "mongodb";
import webpush from "web-push";

webpush.setVapidDetails(
	"mailto: selfieTWunibo@gmail.com",
	process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY as string,
	process.env.NEXT_PUBLIC_VAPID_PRIVATE_KEY as string
);

export async function sendNotification(
	userId: string,
	notificationData: {
		title: string;
		body: string;
		image: string;
		icon: string;
		url: string;
	}
): Promise<boolean> {
	// Ottieniamo la collezione degli utenti
	const client: Collection<User> = await getCollection<User>(USER_COLLECTION);

	const userOut = await findCollectionWrapper<User>({ _id: userId }, client);

	if (userOut.status !== 200) {
		return false;
	}

	const userString: StringUser = (await userOut.json())[0];

	// Otteniamo la lista delle sottoscrizioni dell'utente
	const subscriptionArray = userString.subscriptionList;

	// Creiamo l'oggetto da inviare
	const notificationJSON = JSON.stringify(notificationData);

	// Dobbiamo inviare la notifica a tutti i device dell'utente
	for (const subscription of subscriptionArray) {
		try {
			await webpush.sendNotification(subscription, notificationJSON);
		} catch (e) {
			console.error("Failed to send notification: ", e);
		}
	}

	return true;
}
