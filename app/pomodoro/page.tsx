"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { Button, Container } from "react-bootstrap";
import { FaLightbulb, FaShareNodes } from "react-icons/fa6";
import useSWR from "swr";
import { Sidebar } from "../components/Sidebar";
import { Coffee } from "./Animation/Coffee";
import { Tree } from "./Animation/Tree";
import { ReminderModal } from "./Modals/ReminderModal";
import { ShareModal } from "./Modals/ShareModal";
import { MusicBar } from "./MusicBar/MusicBar";
import "./Pomodoro.css";
import { Setting } from "./Setting/Setting";

async function fetcher(url: string) {
	console.log("Fetching data from " + url);
	const response = await fetch(url);

	if (!response.ok) {
		throw new Error("Errore durante il fetch dei dati");
	}

	return response.json();
}

function PomodoroComponent() {
	const [isStudying, setIsStudying] = useState(true); // true for studying, false for break
	const [isPaused, setIsPaused] = useState(true); // true for paused, false for running
	const [isStarted, setIsStarted] = useState(false); // true for started, false for not started
	const [currentTime, setCurrentTime] = useState(0);
	const [doneCycles, setDoneCycles] = useState(0);
	const [studyTime, setStudyTime] = useState(1);
	const [breakTime, setBreakTime] = useState(1);
	const [sessions, setSessions] = useState(1);
	const [remainingSessions, setRemainingSessions] = useState(sessions);

	const searchParams = useSearchParams();
	let id = searchParams.get("id");
	if (id === "") {
		id = null;
	}

	// Prendimao il pomodoro generale o quello specifico se id é diverso da null
	const { data, error } = useSWR(
		id
			? "/api/calendar/session/" + id + "/getSession"
			: "/api/user/getUser",
		fetcher
	);

	useEffect(() => {
		if (data) {
			const pomodoroData = id ? data.settings : data.pomodoro;
			setStudyTime(pomodoroData.studyTime);
			setBreakTime(pomodoroData.breakTime);
			if (id) {
				setSessions(pomodoroData.cycles - data.cycles);
				setDoneCycles(data.cycles);
			} else {
				setSessions(pomodoroData.cycles);
			}
		}
	}, [data, id]);

	useEffect(() => {
		setCurrentTime(studyTime * 60);
	}, [studyTime]);

	const reset = useCallback(() => {
		setIsPaused(true);
		setIsStarted(false);
		setIsStudying(true);
		setCurrentTime(studyTime * 60);
	}, [studyTime]);

	const updatePomodoro = useCallback(
		async (retries = 5) => {
			const response = await fetch(
				"/api/calendar/session/modifyPomodoro",
				{
					method: "PATCH",
					body: JSON.stringify({ _id: id, cycles: doneCycles + 1 }),
					headers: {
						"Content-Type": "application/json"
					}
				}
			);

			if (!response.ok) {
				if (retries > 0) {
					console.log("Errore, nuovo tentativo...");
					setTimeout(() => updatePomodoro(retries - 1), 1000);
				} else {
					console.log("Errore persistente. Impossibile aggiornare.");
				}
			}
		},
		[id, doneCycles]
	);

	const saveSettingsFetch = useCallback(
		async (retries = 5) => {
			const bodyData = {
				cycles: sessions,
				studyTime: studyTime,
				breakTime: breakTime
			};

			const response = await fetch("/api/user/modifyPomodoro", {
				method: "PATCH",
				body: JSON.stringify(bodyData),
				headers: {
					"Content-Type": "application/json"
				}
			});

			if (!response.ok) {
				if (retries > 0) {
					console.log("Errore, nuovo tentativo...");
					setTimeout(() => saveSettingsFetch(retries - 1), 1000);
				} else {
					console.log("Errore persistente. Impossibile aggiornare.");
				}
			}
		},
		[sessions, studyTime, breakTime]
	);

	// Ogni 10 secondi se non ci sono nuove modifiche salva le impostazioni
	const timeout = useRef<null | NodeJS.Timeout>(null);
	useEffect(() => {
		if (id === null) {
			if (timeout.current) {
				clearTimeout(timeout.current);
			}

			timeout.current = setTimeout(() => {
				console.log("Salvataggio impostazioni...");
				saveSettingsFetch();
			}, 5000);
		}
	}, [sessions, studyTime, breakTime, saveSettingsFetch, id]);

	/*
	 * Se sono finite le sessioni resetta tutto
	 * Se sta studiando decrementa le sessioni
	 * Cambia lo stato studio/break
	 * Imposta il tempo associato allo stato
	 * */
	const handleFinish = useCallback(() => {
		if (remainingSessions === 0) {
			reset();
		} else {
			if (isStudying) {
				const updatedSessions = remainingSessions - 1;
				setRemainingSessions(updatedSessions);
				if (id) {
					setSessions(updatedSessions);
					console.log("Aggiornamento sessioni...");
					updatePomodoro();
					setDoneCycles(doneCycles + 1);
				}
			}
			setIsStudying(!isStudying);
			setCurrentTime(isStudying ? breakTime * 60 : studyTime * 60);
		}
	}, [
		id,
		isStudying,
		remainingSessions,
		breakTime,
		studyTime,
		reset,
		doneCycles,
		updatePomodoro
	]);

	// Timer
	useEffect(() => {
		if (!isPaused) {
			const interval = setInterval(() => {
				if (currentTime === 1) {
					handleFinish();
				} else {
					setCurrentTime(currentTime - 1);
				}
			}, 1000);
			return () => clearInterval(interval);
		}
	}, [isPaused, currentTime, handleFinish]);

	function calcTime() {
		const minutes = Math.floor(currentTime / 60);
		const seconds = currentTime % 60;
		return `${minutes < 10 ? "0" + minutes : minutes}:${seconds < 10 ? "0" + seconds : seconds}`;
	}

	function handleStart() {
		setIsPaused(false);
		setIsStarted(true);
		setRemainingSessions(sessions);
	}

	function handleResume() {
		setIsPaused(!isPaused);
	}

	function handleRestart() {
		setIsPaused(false);
		setCurrentTime(isStudying ? studyTime * 60 : breakTime * 60);
	}

	function handleSetCompleted() {
		setIsPaused(false);
		handleFinish();
	}

	function TimerBlock() {
		let header = calcTime();
		if (id !== null && !isStarted && sessions === 0) {
			header = "Sessioni completate!";
		}

		let handlerButtons;
		if (isStarted && isPaused) {
			handlerButtons = (
				<>
					<Button variant="link" onClick={handleRestart}>
						Restart
					</Button>
					<Button variant="link" onClick={handleSetCompleted}>
						Completed
					</Button>
					<Button variant="link" onClick={reset}>
						Stop
					</Button>
				</>
			);
		}

		let subHeader = <>Sessioni rimanenti: {remainingSessions}</>;
		if (isStudying && sessions === 1) {
			subHeader = <>Ultima sessione!</>;
		} else if (!isStudying && sessions === 0) {
			subHeader = <>Ultima pausa!</>;
		}

		/*
		 * Mostriamo i bottoni per start, resume e pause solo se
		 * il numero di sessioni > 0
		 * oppure se é in pausa (l'ultima ha sessions = 0)
		 * Necessario per evitare che si possa iniziare una nuova sessione quando id
		 */
		return (
			<div className="d-flex flex-column align-items-center justify-content-center">
				<h1 style={{ fontSize: "100px" }}>{header}</h1>
				{isStarted && <h1 style={{ fontSize: "50px" }}>{subHeader}</h1>}
				{(sessions > 0 || !isStudying) && (
					<Button
						variant="link"
						onClick={isStarted ? handleResume : handleStart}
					>
						{!isStarted ? " Start" : isPaused ? "Resume" : "Pause"}
					</Button>
				)}
				{handlerButtons}
			</div>
		);
	}

	return (
		<Container
			fluid
			className="vh-100 d-flex flex-column"
			style={{ backgroundColor: "rgb(240, 240, 240)" }}
		>
			{error && <h1>Invalid Session</h1>}
			{!data && !error && <h1>Caricamento...</h1>}
			{data && !error && (
				<>
					<div className="d-flex position-absolute top-0 end-0 m-5 z-3">
						<ReminderModal
							studyTime={studyTime}
							sessions={sessions}
							breakTime={breakTime}
						>
							<FaLightbulb size={30} className="me-2" />
						</ReminderModal>
						<ShareModal
							studyTime={studyTime}
							sessions={sessions}
							breakTime={breakTime}
						>
							<FaShareNodes size={30} />
						</ShareModal>
					</div>
					{isStudying ? (
						<Tree
							time={studyTime * 60}
							started={isStarted}
							paused={isPaused}
						></Tree>
					) : (
						<Coffee
							time={breakTime * 60}
							started={isStarted}
							paused={isPaused}
						></Coffee>
					)}
					<Sidebar></Sidebar>
					<TimerBlock></TimerBlock>
					{!isStarted && id === null && (
						<div className="d-flex flex-column flex-md-row justify-content-center">
							<Setting
								name="Study Time"
								getter={studyTime}
								setter={setStudyTime}
							></Setting>
							<Setting
								name="Sessions"
								getter={sessions}
								setter={setSessions}
							></Setting>
							<Setting
								name="Break Time"
								getter={breakTime}
								setter={setBreakTime}
							></Setting>
						</div>
					)}
					<MusicBar></MusicBar>
				</>
			)}
		</Container>
	);
}

export default function Pomodoro() {
	return (
		<Suspense fallback={<h1>Caricamento...</h1>}>
			<PomodoroComponent />
		</Suspense>
	);
}
