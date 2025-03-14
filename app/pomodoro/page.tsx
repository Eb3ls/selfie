"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { Button } from "react-bootstrap";
import { IoMusicalNotes, IoShareSocial, IoTimerOutline } from "react-icons/io5";
import useSWR from "swr";
import { GlobalSideBar } from "../components/GlobalSideBar";
import { Coffee } from "./Animation/Coffee";
import { Tree } from "./Animation/Tree";
import { MusicView } from "./MusicBar/MusicView";
import { Setting } from "./Setting";
import { ShareModal } from "./ShareModal";

async function fetcher(url: string) {
	console.log("Fetching data from " + url);
	const response = await fetch(url);

	if (!response.ok) {
		throw new Error("Errore durante il fetch dei dati");
	}

	return response.json();
}

function PomodoroImplementation() {
	const [isStudying, setIsStudying] = useState(true); // true for studying, false for break
	const [isPaused, setIsPaused] = useState(true); // true for paused, false for running
	const [isStarted, setIsStarted] = useState(false); // true for started, false for not started
	const [currentTime, setCurrentTime] = useState(0);
	const [doneCycles, setDoneCycles] = useState(0);
	const [studyTime, setStudyTime] = useState(1);
	const [breakTime, setBreakTime] = useState(1);
	const [sessions, setSessions] = useState(1);
	const [remainingSessions, setRemainingSessions] = useState(sessions);
	const [isMusicView, setIsMusicView] = useState(false);
	const [resetTrigger, setResetTrigger] = useState(0);
	const originalSessions = useRef<number>(0);

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
				originalSessions.current = pomodoroData.cycles;
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
		setResetTrigger(resetTrigger + 1);
	}, [studyTime, resetTrigger]);

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
		setResetTrigger(resetTrigger + 1);
		setCurrentTime(isStudying ? studyTime * 60 : breakTime * 60);
	}

	function handleSetCompleted() {
		setIsPaused(false);
		handleFinish();
	}

	function LargeButton(text: string, onClick: () => void) {
		return (
			<Button
				onClick={onClick}
				className="btn btn-primary btn-lg rounded-pill mt-4 px-5 py-3"
				size="lg"
			>
				{text}
			</Button>
		);
	}

	function TimerBlock() {
		const getHeader = () => {
			if (id !== null && !isStarted && sessions === 0) {
				return "Sessioni completate!";
			}
			return calcTime();
		};

		const getSubHeader = () => {
			if (isStudying && sessions === 1) {
				return <>Ultima sessione!</>;
			} else if (!isStudying && sessions === 0) {
				return <>Ultima pausa!</>;
			}
			return <>Sessioni rimanenti: {remainingSessions}</>;
		};

		const getMainButtonText = () => {
			if (!isStarted) return "Start";
			return isPaused ? "Resume" : "Pause";
		};

		const renderHandlerButtons = () => {
			if (isStarted && isPaused) {
				return (
					<>
						{LargeButton("Restart", handleRestart)}
						{LargeButton("Set Completed", handleSetCompleted)}
						{LargeButton("Stop", reset)}
					</>
				);
			}
			return null;
		};

		const shouldShowMainButton = sessions > 0 || !isStudying;

		return (
			<div className="d-flex flex-column align-items-center justify-content-center container-sm">
				<h1 className="display-1 fw-semibold">{getHeader()}</h1>
				{isStarted && <h1 className="display-4">{getSubHeader()}</h1>}
				<div className="d-flex flex-column w-100">
					{shouldShowMainButton &&
						LargeButton(
							getMainButtonText(),
							isStarted ? handleResume : handleStart
						)}
					{renderHandlerButtons()}
				</div>
			</div>
		);
	}

	function InvalidSessionBlock() {
		return (
			<div className="d-flex flex-column align-items-center justify-content-center h-100">
				<h1 className="display-4 text-danger mb-3">Invalid Session</h1>
				<p className="text-muted">
					La sessione a cui stai tentando di accedere non esiste o è
					scaduta
				</p>
				<Button href="/home" variant="primary" className="mt-3">
					Torna alla home
				</Button>
			</div>
		);
	}

	function LoadingBlock() {
		return (
			<div className="d-flex flex-column align-items-center justify-content-center h-100">
				<div className="spinner-border text-primary mb-3" role="status">
					<span className="visually-hidden">Caricamento...</span>
				</div>
				<h2 className="h4 text-muted">Caricamento...</h2>
			</div>
		);
	}

	return (
		<div className="d-flex vh-100 flex-column">
			<GlobalSideBar />
			<div
				className="d-flex flex-column position-relative flex-grow-1"
				style={{ backgroundColor: "rgb(240, 240, 240)" }}
			>
				{error && <InvalidSessionBlock />}
				{!data && !error && <LoadingBlock />}
				{data && !error && (
					<>
						<div className="d-flex position-absolute top-0 end-0 m-4 me-5">
							<Button
								variant="link"
								onClick={() => {
									setIsMusicView(!isMusicView);
									console.log(isMusicView);
								}}
								className="p-0 m-0"
								style={{ zIndex: 1 }}
							>
								{isMusicView ? (
									<IoTimerOutline size={30} />
								) : (
									<IoMusicalNotes size={30} />
								)}
							</Button>
							<ShareModal
								studyTime={studyTime}
								sessions={originalSessions.current || sessions}
								breakTime={breakTime}
								id={id}
							>
								<IoShareSocial
									size={30}
									className="text-primary"
								/>
							</ShareModal>
						</div>

						<div className="d-flex flex-column h-100">
							<div className="flex-grow-1">
								{isStudying ? (
									<Tree
										resetTrigger={resetTrigger}
										time={studyTime * 60}
										started={isStarted}
										paused={isPaused}
									/>
								) : (
									<Coffee />
								)}
							</div>
							{isMusicView ? (
								<MusicView />
							) : (
								<div className="d-flex flex-column justify-content-center m-4">
									<TimerBlock></TimerBlock>
									{!isStarted && id === null && (
										<div className="d-flex flex-column justify-content-center m-4">
											<Setting
												name="Study Time"
												maxValue={600}
												getter={studyTime}
												setter={setStudyTime}
											></Setting>
											<Setting
												name="Sessions"
												maxValue={60}
												getter={sessions}
												setter={setSessions}
											></Setting>
											<Setting
												name="Break Time"
												maxValue={600}
												getter={breakTime}
												setter={setBreakTime}
											></Setting>
										</div>
									)}
								</div>
							)}
						</div>
					</>
				)}
			</div>
		</div>
	);
}

export default function Pomodoro() {
	return (
		<Suspense fallback={<div>Loading search params...</div>}>
			<PomodoroImplementation />
		</Suspense>
	);
}
