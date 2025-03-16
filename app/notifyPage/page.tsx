"use client";

import { setupNotifications } from "@/utils/notification/notification_client";
import { useEffect, useRef } from "react";

export default function Home() {
	const oneTime = useRef(false);

	useEffect(() => {
		if (!oneTime.current) {
			console.log("Setup delle notifiche iniziato");
			setupNotifications();
			oneTime.current = true;
		}
	}, []);

	return <></>;
}
