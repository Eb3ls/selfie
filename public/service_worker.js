self.addEventListener("push", function (event) {
	if (!event.data) {
		return;
	}

	const payload = event.data.json();
	const { body, icon, image, badge, url, title } = payload;
	const notificationTitle = title ?? "Hi";
	const notificationOptions = {
		body,
		icon,
		image,
		data: {
			url
		},
		badge
	};

	event.waitUntil(
		self.registration
			.showNotification(notificationTitle, notificationOptions)
			.then(() => {
				sendDeliveryReportAction();
			})
	);
});

self.addEventListener("notificationclick", function (event) {
	const notification = event.notification;
	const url = notification.data.url;

	event.notification.close();

	event.waitUntil(
		clients.openWindow(url).then(() => {
			sendClickReportAction();
		})
	);
});

const sendDeliveryReportAction = () => {
	console.log("Web push delivered.");
};

const sendClickReportAction = () => {
	console.log("Web push clicked.");
};
