"use client";

import { PomodoroSettings } from "@/utils/db/db";
import { safeFetch } from "@/utils/fetch/fetch";
import { removeNotifications } from "@/utils/notification/notification_client";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";

type ReducedUser = {
	_id: string;
	username: string;
	firstName: string;
	lastName: string;
	email: string;
	birthDay: string;
	userStatus: string;
	pomodoro: PomodoroSettings;
	previews: {
		calendar: {
			activity: boolean;
			event: boolean;
			session: boolean;
			projectActivity: boolean;
			maxOccurrences: number;
		};
		maxChats: number;
		maxNotes: number;
	};
	alarmPreferences: {
		email: boolean;
		push: boolean;
	};
};

interface UserContextType {
	user: ReducedUser | null;
	loading: boolean;
	error: string | null;
	fetchUser: () => void;
	logOut: () => void;
	updateUser: (user: ReducedUser) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
	const [userData, setUserData] = useState<ReducedUser | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const router = useRouter();

	// Funzione per aggiornare lo stato dell'utente
	const updateUser = (newUserData: ReducedUser) => {
		setUserData(newUserData);
	};

	async function fetchUserData() {
		setLoading(true);
		const response = await safeFetch<ReducedUser>(
			fetch("/api/user/getUser")
		);

		if (!response.ok || response.redirected) {
			setError("Failed to fetch user data");
			setLoading(false);
			return;
		}

		const data: ReducedUser = response.body;
		setUserData(data);
		setLoading(false);
	}

	async function logOutFunction() {
		await removeNotifications();
		const response = await safeFetch(fetch("/api/user/logout"));

		if (!response.ok || response.redirected) {
			toast.error("Impossibile effettuare il logout");
			setError("Failed to logout");
			return;
		}

		setUserData(null);
		toast.success("Logout effettuato con successo");
		router.push("/");
	}

	useEffect(() => {
		if (!userData && !error) {
			fetchUserData();
		}
	});

	const value = {
		user: userData,
		loading,
		error,
		fetchUser: fetchUserData,
		logOut: logOutFunction,
		updateUser: updateUser
	};

	return (
		<UserContext.Provider value={value}>{children}</UserContext.Provider>
	);
}

export function useUser() {
	const context = useContext(UserContext);
	if (context === undefined) {
		throw new Error("useUser must be used within a UserProvider");
	}
	return context;
}
