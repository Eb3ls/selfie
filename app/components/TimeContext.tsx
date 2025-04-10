"use client";

import {
	ReactNode,
	createContext,
	useContext,
	useEffect,
	useState
} from "react";
import { toast } from "react-toastify";

type ResponseType = {
	time: Date;
};

interface TimeContextType {
	dateTime: Date;
	setTime: (newTime: Date, realTime: boolean) => Promise<void>;
	refreshTime: () => Promise<void>;
}

const TimeContext = createContext<TimeContextType | undefined>(undefined);

export function TimeProvider({ children }: { children: ReactNode }) {
	const [dateTime, setDateTime] = useState(new Date());

	// Funzione per richiedere il tempo dal server
	async function refreshTime() {
		try {
			const res = await fetch("/api/timeMachine");
			if (!res.ok) {
				throw new Error("Errore nel recupero dell'orario dal server");
			}
			// Si assume che il server restituisca il tempo in formato stringa ISO o equivalente
			const data: ResponseType = await res.json();
			setDateTime(new Date(data.time));
		} catch (error) {
			toast.error("Errore nel recupero dell'orario dalla time machine");
		}
	}

	// Funzione per impostare il tempo sul server
	async function setTime(newTime: Date, realTime: boolean) {
		try {
			const res = await fetch("/api/timeMachine", {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({
					realTime,
					requestedDate: newTime.toISOString()
				})
			});

			if (!res.ok) {
				throw new Error("Errore nella modifica dell'orario sul server");
			}

			await refreshTime();
		} catch (error) {
			toast.error("Errore nella modifica dell'orario sulla time machine");
		}
	}

	// Al montaggio del provider, sincronizza la data iniziale
	useEffect(() => {
		refreshTime();
	}, []);

	// Aggiorna la data localmente ogni secondo
	useEffect(() => {
		const timer = setInterval(() => {
			setDateTime((prev) => new Date(prev.getTime() + 1000));
		}, 1000);

		return () => clearInterval(timer);
	}, []);

	return (
		<TimeContext.Provider value={{ dateTime, setTime, refreshTime }}>
			{children}
		</TimeContext.Provider>
	);
}

export function useTime() {
	const context = useContext(TimeContext);
	if (context === undefined) {
		throw new Error("useTime must be used within a TimeProvider");
	}
	return context;
}
