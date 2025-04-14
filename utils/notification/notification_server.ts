import {
	StringUser,
	USER_COLLECTION,
	User,
	findCollectionWrapper,
	getCollection
} from "@/utils/db/db";
import { Collection } from "mongodb";
import nodemailer from "nodemailer";
import webpush from "web-push";

webpush.setVapidDetails(
	"mailto: selfieTWunibo@gmail.com",
	process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY as string,
	process.env.NEXT_PUBLIC_VAPID_PRIVATE_KEY as string
);

const GMAIL_EMAIL: string = process.env.GMAIL_EMAIL as string;
const GMAIL_PASSWORD: string = process.env.GMAIL_PASSWORD as string;

// Imposta l'account Gmail di Nodemailer
const transporter = nodemailer.createTransport({
	service: "gmail",
	auth: {
		user: GMAIL_EMAIL,
		pass: GMAIL_PASSWORD
	}
});

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

	const { email, push } = userString.alarmPreferences;

	// Otteniamo la lista delle sottoscrizioni dell'utente
	const subscriptionArray = userString.subscriptionList;

	// Creiamo l'oggetto da inviare
	const notificationJSON = JSON.stringify(notificationData);

	if (push) {
		// Dobbiamo inviare la notifica a tutti i device dell'utente
		for (const subscription of subscriptionArray) {
			try {
				await webpush.sendNotification(subscription, notificationJSON);
			} catch (e) {
				console.error("Failed to send notification: ", e);
			}
		}
	}

	if (email) {
		try {
			const emailOptions = {
				from: GMAIL_EMAIL,
				to: userString.email,
				subject: "Selfie - " + notificationData.title,
				text: notificationData.body
			};
			await transporter.sendMail(emailOptions);
		} catch (e) {
			console.error("Failed to send email: ", e);
		}
	}

	return true;
}
