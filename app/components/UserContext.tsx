"use client";

import { PomodoroSettings } from "@/utils/db/db";
import { createContext, useContext, useEffect, useState } from "react";

type ReducedUser = {
	_id: string;
	username: string;
	firstName: string;
	lastName: string;
	email: string;
	birthDay: string;
	userStatus: string;
	profilePic: string;
	pomodoro: PomodoroSettings;
};

interface UserContextType {
	user: ReducedUser | null;
	loading: boolean;
	error: Error | null;
	fetchUser: () => void;
	logOut: () => void;
	updateUser: (user: ReducedUser) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
	const [userData, setUserData] = useState<ReducedUser | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	// Funzione per aggiornare lo stato dell'utente
	const updateUser = (newUserData: ReducedUser) => {
		setUserData(newUserData);
	};

	async function fetchUserData() {
		try {
			setLoading(true);
			const response = await fetch("/api/user/getUser");
			if (!response.ok) {
				throw new Error("Failed to fetch user data");
			}
			const data: ReducedUser = await response.json();
			setUserData(data);
		} catch (error) {
			setError(error as Error);
		}
		setLoading(false);
	}

	async function logOutFunction() {
		try {
			await fetch("/api/user/logout", {
				method: "POST",
				headers: { "Content-Type": "application/json" }
			});
			setUserData(null);
			alert("Logout successful!");
			window.location.href = "/";
		} catch (error) {
			setError(error as Error);
			alert("Logout failed!");
		}
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
