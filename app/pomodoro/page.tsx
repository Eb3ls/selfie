"use client";

import { generalFetcher, safeFetch } from "@/utils/fetch/fetch";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { Button } from "react-bootstrap";
import { IoMusicalNotes, IoTimerOutline } from "react-icons/io5";
import { toast } from "react-toastify";
import useSWR from "swr";
import { GlobalSideBar } from "../components/GlobalSideBar";
import { useUser } from "../components/UserContext";
import { Coffee } from "./Animation/Coffee";
import { Tree } from "./Animation/Tree";
import { MusicView } from "./MusicBar/MusicView";
import "./Pomodoro.css";
import { Setting } from "./Setting";

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

	const { fetchUser } = useUser();

	const searchParams = useSearchParams();
	let id = searchParams.get("id");
	if (id === "") {
		id = null;
	}

	// Prendimao il pomodoro generale o quello specifico se id é diverso da null
	const { data, error } = useSWR<any>(
		id
			? "/api/calendar/session/" + id + "/getSession"
			: "/api/user/getUser",
		generalFetcher
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
			const response = await safeFetch(
				fetch("/api/calendar/session/modifyPomodoro", {
					method: "PATCH",
					body: JSON.stringify({ _id: id, cycles: doneCycles + 1 }),
					headers: {
						"Content-Type": "application/json"
					}
				})
			);

			if (!response.ok) {
				if (retries > 0) {
					setTimeout(() => updatePomodoro(retries - 1), 1000);
				} else {
					toast.error(
						"Errore persistente. Impossibile aggiornare i cicli sul server"
					);
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

			const response = await safeFetch(
				fetch("/api/user/modifyPomodoro", {
					method: "PATCH",
					body: JSON.stringify(bodyData),
					headers: {
						"Content-Type": "application/json"
					}
				})
			);

			if (!response.ok) {
				if (retries > 0) {
					setTimeout(() => saveSettingsFetch(retries - 1), 1000);
				} else {
					toast.error(
						"Errore persistente. Impossibile salvare le impostazioni"
					);
				}
			} else {
				fetchUser();
			}
		},
		[sessions, studyTime, breakTime, fetchUser]
	);

	// Ogni 10 secondi se non ci sono nuove modifiche salva le impostazioni
	const timeout = useRef<null | NodeJS.Timeout>(null);
	useEffect(() => {
		if (id === null) {
			if (timeout.current) {
				clearTimeout(timeout.current);
			}

			timeout.current = setTimeout(() => {
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
			return (
				<div className="fs-3 text-muted fw-semibold">
					Sessioni rimanenti: {remainingSessions}
				</div>
			);
		};

		const getMainButtonText = () => {
			if (!isStarted) return "Inizia";
			return isPaused ? "Riprendi" : "Pausa";
		};

		const renderHandlerButtons = () => {
			if (isStarted && isPaused) {
				return (
					<>
						{LargeButton("Ricomincia", handleRestart)}
						{LargeButton("Completato", handleSetCompleted)}
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
				<h1 className="display-4 text-danger mb-3">
					Sessione non valida
				</h1>
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

	function TooEarlyBlock() {
		return (
			<div className="d-flex flex-column align-items-center justify-content-center h-100">
				<h1 className="display-4 text-danger mb-3">
					Sessione non ancora iniziata
				</h1>
				<p className="text-muted">
					La sessione a cui stai tentando di accedere non è ancora
					iniziata
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
		<div className="d-flex dvh-100 flex-column">
			<GlobalSideBar />
			<div
				className="d-flex flex-column position-relative flex-grow-1 bg-light"
				style={{ minHeight: "0" }}
			>
				{error &&
					(error.message ===
					"TimeMachine date is before session start date" ? (
						<TooEarlyBlock />
					) : (
						<InvalidSessionBlock />
					))}
				{!data && !error && <LoadingBlock />}
				{data && !error && (
					<>
						<div className="d-flex position-absolute top-0 end-0 m-4 me-5">
							<Button
								variant="link"
								onClick={() => {
									setIsMusicView(!isMusicView);
								}}
								className="p-0 m-0"
								style={{ zIndex: 1 }}
							>
								{isMusicView ? (
									<IoTimerOutline
										size={30}
										className="hover-lift"
									/>
								) : (
									<IoMusicalNotes
										size={30}
										className="hover-lift"
									/>
								)}
							</Button>
						</div>

						<div className="d-flex flex-column h-100">
							<MusicView show={isMusicView} />
							<div className="flex-grow-1">
								{isStudying ? (
									<Tree
										resetTrigger={resetTrigger}
										time={studyTime * 60}
										started={isStarted}
										paused={isPaused}
										show={!isMusicView}
									/>
								) : (
									<Coffee show={!isMusicView} />
								)}
							</div>
							<div
								className="flex-column justify-content-center m-2"
								style={{
									display: isMusicView ? "none" : "flex"
								}}
							>
								<TimerBlock></TimerBlock>
								{!isStarted && id === null && (
									<div className="d-flex flex-column justify-content-center m-2 mb-4">
										<Setting
											name="Tempo di studio (min)"
											maxValue={600}
											getter={studyTime}
											setter={setStudyTime}
										/>
										<Setting
											name="Sessioni"
											maxValue={60}
											getter={sessions}
											setter={setSessions}
										/>
										<Setting
											name="Pausa (min)"
											maxValue={600}
											getter={breakTime}
											setter={setBreakTime}
										/>
									</div>
								)}
							</div>
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
