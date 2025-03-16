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
	if (await isServiceWorkerRegistered()) {
		console.warn("Service Worker già registrato!");
		return false;
	}

	// 4. Registra il Service Worker
	try {
		await navigator.serviceWorker.register(SERVICE_WORKER_FILE_PATH);
	} catch (error) {
		console.warn("Registrazione del Service Worker fallita!", error);
		return false;
	}

	// 5. Attesa della registrazione del Service Worker
	const registration = await navigator.serviceWorker.ready;

	// 6. Sottoscrizione alle notifiche
	const options = {
		userVisibleOnly: true,
		applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
	};

	let pushSubscription;

	try {
		pushSubscription = await registration.pushManager.subscribe(options);
	} catch (error) {
		console.warn("Errore durante la sottoscrizione alle notifiche!", error);
		return false;
	}

	// 7. Invio al server
	const response = await fetch("/api/user/setNotify", {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify({
			subscription: pushSubscription
		})
	});

	if (!response.ok) {
		console.warn("Errore durante l'invio delle informazioni al server!");
		return false;
	}

	const data = await response.json();
	console.log("Risposta del server: ", data);

	return true;
}
