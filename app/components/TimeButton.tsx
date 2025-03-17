"use client";

import { useTime } from "@/app/components/TimeContext";
import { useState } from "react";
import { Button } from "react-bootstrap";
import { FaClock, FaPlus, FaSync, FaUndo } from "react-icons/fa";

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
			<Button
				onClick={() => setMenuOpen(!menuOpen)}
				style={{
					position: "fixed",
					bottom: "20px",
					right: "20px",
					width: "50px",
					height: "50px",
					borderRadius: "50%",
					padding: 0,
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					boxShadow: "0 2px 15px rgba(0,0,0,0.2)",
					border: "none",
					transition: "transform 0.2s ease",
					transform: menuOpen ? "rotate(45deg)" : "none",
					zIndex: 1000,
					background: "linear-gradient(135deg, #6a11cb, #2575fc)"
				}}
			>
				<FaClock style={{ color: "white", fontSize: "20px" }} />
			</Button>
			{menuOpen && (
				<div
					style={{
						position: "fixed",
						bottom: "80px",
						right: "20px",
						backgroundColor: "#fff",
						padding: "20px",
						border: "none",
						borderRadius: "12px",
						boxShadow: "0 5px 20px rgba(0,0,0,0.15)",
						zIndex: 1001,
						width: "300px"
					}}
				>
					<div className="mb-3 text-center fw-bold text-secondary">
						Data e ora attuale:
						<div className="mt-1 text-primary">
							{dateTime
								? dateTime.toLocaleString()
								: "Caricamento..."}
						</div>
					</div>
					<div className="mb-3">
						<input
							type="datetime-local"
							value={inputTime}
							onChange={(e) => setInputTime(e.target.value)}
							className="form-control"
							style={{
								borderRadius: "8px",
								border: "1px solid #dee2e6",
								padding: "8px 12px"
							}}
						/>
					</div>
					<div className="d-flex flex-column gap-2">
						<Button
							onClick={handleSetTime}
							variant="primary"
							className="d-flex align-items-center justify-content-center gap-2"
							style={{
								background:
									"linear-gradient(135deg, #6a11cb, #2575fc)",
								border: "none",
								borderRadius: "8px",
								padding: "8px 16px"
							}}
						>
							<FaPlus size={14} /> Imposta orario
						</Button>
						<Button
							onClick={handleConnect}
							variant="outline-primary"
							className="d-flex align-items-center justify-content-center gap-2"
							style={{ borderRadius: "8px" }}
						>
							<FaSync size={14} /> Connetti
						</Button>
						<Button
							onClick={handleRealTime}
							variant="outline-secondary"
							className="d-flex align-items-center justify-content-center gap-2"
							style={{ borderRadius: "8px" }}
						>
							<FaUndo size={14} /> Tempo reale
						</Button>
					</div>
				</div>
			)}
		</div>
	);
}
