"use client";

import { setupNotifications } from "@/utils/notification/notification_client";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

export function NotificationContainer() {
	const oneTime = useRef(false);

	const pathname = usePathname();

	useEffect(() => {
		if (!oneTime.current) {
			if (
				pathname.startsWith("/calendar") ||
				pathname.startsWith("/chat") ||
				pathname.startsWith("/home") ||
				pathname.startsWith("/inbox") ||
				pathname.startsWith("/notepad") ||
				pathname.startsWith("/pomodoro") ||
				pathname.startsWith("/projects") ||
				pathname.startsWith("/settings")
			) {
				setupNotifications();
				oneTime.current = true;
			}
		}
	}, [pathname]);

	return <></>;
}
