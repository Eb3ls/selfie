"use client";

import { useTime } from "@/app/components/TimeContext";
import { useState } from "react";
import { FaClock } from "react-icons/fa";

export function TimeButton() {
	const { dateTime, refreshTime, setTime } = useTime();

	const [menuOpen, setMenuOpen] = useState(false);
	const [inputTime, setInputTime] = useState("");

	async function handleSetTime() {
		if (inputTime === "") {
			alert("Inserisci una data valida!");
			return;
		}

		await setTime(new Date(inputTime), false);

		setInputTime("");
	}

	async function handleConnect() {
		const response = await fetch("/api/timeMachine", { method: "PATCH" });
		if (!response.ok) {
			alert("Errore durante la connessione!");
			return;
		}
		alert("Connessione riuscita!");
		await refreshTime();
	}

	async function handleRealTime() {
		await setTime(new Date(), true);
	}

	return (
		<div>
			<div
				onClick={() => setMenuOpen(!menuOpen)}
				style={{
					position: "fixed",
					bottom: "20px",
					right: "20px",
					width: "50px",
					height: "50px",
					borderRadius: "50%",
					backgroundColor: "rgba(0, 123, 255, 0.8)",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					cursor: "pointer",
					zIndex: 1000
				}}
			>
				<FaClock style={{ color: "white", fontSize: "20px" }} />
			</div>
			{menuOpen && (
				<div
					style={{
						position: "fixed",
						bottom: "80px",
						right: "20px",
						backgroundColor: "#fff",
						padding: "10px",
						border: "1px solid #ccc",
						borderRadius: "5px",
						boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
						zIndex: 1001
					}}
				>
					<div>
						Data e ora:{" "}
						{dateTime
							? dateTime.toLocaleString()
							: "Caricamento..."}
					</div>
					<input
						type="datetime-local"
						value={inputTime}
						onChange={(e) => setInputTime(e.target.value)}
						style={{ marginTop: "5px", marginBottom: "5px" }}
					/>
					<button onClick={handleSetTime}>Imposta</button>
					<button
						onClick={handleConnect}
						style={{ marginTop: "5px" }}
					>
						Connetti
					</button>
					<button
						onClick={handleRealTime}
						style={{ marginTop: "5px" }}
					>
						Ripristina tempo reale
					</button>
				</div>
			)}
		</div>
	);
}
