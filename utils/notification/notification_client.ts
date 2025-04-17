import { safeFetch } from "@/utils/fetch/fetch";

const SERVICE_WORKER_FILE_PATH = "./service_worker.js";

export function areNotificationsSupported() {
	if (
		!("serviceWorker" in navigator) ||
		!("PushManager" in window) ||
		!("showNotification" in ServiceWorkerRegistration.prototype)
	) {
		return false;
	}
	return true;
}

export function areNotificationPermitted() {
	return (
		Notification.permission == "granted" ||
		Notification.permission == "default"
	);
}

export async function isServiceWorkerRegistered() {
	const serviceWorker = await navigator.serviceWorker.getRegistration();
	if (serviceWorker === undefined) {
		return false;
	}
	return true;
}

export async function setupNotifications(): Promise<boolean> {
	// Questa funzione farà tutto il setup per le notifiche
	// 1. Verifica se il browser supporta le notifiche
	if (!areNotificationsSupported()) {
		console.warn("Il browser non supporta le notifiche!");
		return false;
	}

	// 2. Verifica il permesso per le notifiche
	if (!areNotificationPermitted()) {
		console.warn("Permesso per le notifiche negato!");
		return false;
	}

	// 3. Verifica se il Service Worker è già registrato
	if (!(await isServiceWorkerRegistered())) {
		// 3.1. Registra il Service Worker
		try {
			await navigator.serviceWorker.register(SERVICE_WORKER_FILE_PATH);
		} catch (error) {
			console.warn("Registrazione del Service Worker fallita!", error);
			return false;
		}
	}

	// 4. Attesa della registrazione del Service Worker
	const registration = await navigator.serviceWorker.ready;

	// 5. Sottoscrizione alle notifiche
	const options = {
		userVisibleOnly: true,
		applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
	};

	let pushSubscription = await registration.pushManager.getSubscription();

	if (pushSubscription) {
		return true;
	}

	try {
		pushSubscription = await registration.pushManager.subscribe(options);
	} catch (error) {
		console.warn("Errore durante la sottoscrizione alle notifiche!", error);
		return false;
	}

	// 6. Invio al server
	const response = await safeFetch(
		fetch("/api/user/setNotify", {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				subscription: pushSubscription
			})
		})
	);

	if (!response.ok) {
		console.warn("Errore durante l'invio delle informazioni al server!");
		return false;
	}

	return true;
}

export async function removeNotifications(): Promise<boolean> {
	// 1. Verifica se il browser supporta le notifiche
	if (!areNotificationsSupported()) {
		console.warn("Il browser non supporta le notifiche!");
		return false;
	}

	// 2. Verifica se il Service Worker è già registrato
	if (!(await isServiceWorkerRegistered())) {
		return true;
	}

	// 3. Otteniamo il Service Worker
	const registration = await navigator.serviceWorker.ready;

	// 4. Recupera la push subscription
	const subscription = await registration.pushManager.getSubscription();

	if (!subscription) {
		return true;
	}

	// 5. Disiscrizione lato client
	let unsubscribed: boolean;
	try {
		unsubscribed = await subscription.unsubscribe();

		if (!unsubscribed) {
			console.warn("Disiscrizione fallita!");
			return false;
		}
	} catch (error) {
		console.warn("Errore durante la disiscrizione dalle notifiche!", error);
		return false;
	}

	// 6. Notifica al server per rimuovere la subscription
	const response = await safeFetch(
		fetch("/api/user/removeNotify", {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				subscription
			})
		})
	);

	if (!response.ok) {
		console.warn("Errore durante la rimozione delle notifiche sul server");
		return false;
	}

	return true;
}
