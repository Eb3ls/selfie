"use client";

import { useSearchParams } from "next/navigation";
import React from "react";
import { Button, Container } from "react-bootstrap";
import { FaLightbulb, FaShareNodes } from "react-icons/fa6";
import { Sidebar } from "../components/Sidebar";
import { Coffee } from "./Animation/Coffee";
import { Tree } from "./Animation/Tree";
import { ReminderModal } from "./Modals/ReminderModal";
import { ShareModal } from "./Modals/ShareModal";
import { MusicBar } from "./MusicBar/MusicBar";
import "./Pomodoro.css";
import { Setting } from "./Setting/Setting";

export default function Pomodoro() {
	const [isStudying, setIsStudying] = React.useState(true); // true for studying, false for break
	const [isPaused, setIsPaused] = React.useState(true); // true for paused, false for running
	const [isStarted, setIsStarted] = React.useState(false); // true for started, false for not started
	const [currentTime, setCurrentTime] = React.useState(0);
	const [studyTime, setStudyTime] = React.useState(1);
	const [breakTime, setBreakTime] = React.useState(1);
	const [sessions, setSessions] = React.useState(1);
	const [remainingSessions, setRemainingSessions] = React.useState(sessions);

	const searchParams = useSearchParams();
	const id = searchParams.get("id");

	const reset = React.useCallback(() => {
		setIsPaused(true);
		setIsStarted(false);
		setIsStudying(true);
		setCurrentTime(studyTime * 60);
	}, [studyTime]);

	/*
	 * Se sono finite le sessioni resetta tutto
	 * Se sta studiando decrementa le sessioni
	 * Cambia lo stato studio/break
	 * Imposta il tempo associato allo stato
	 * */
	const handleFinish = React.useCallback(() => {
		if (remainingSessions === 0) {
			reset();
		} else {
			if (isStudying) {
				setRemainingSessions(remainingSessions - 1);
			}
			setIsStudying(!isStudying);
			setCurrentTime(isStudying ? breakTime * 60 : studyTime * 60);
		}
	}, [isStudying, remainingSessions, breakTime, studyTime, reset]);

	// Timer
	React.useEffect(() => {
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

	async function getPomodoroData() {
		//const response = await fetch(`/api/pomodoro/${id}`);
		//const data = await response.json();
		const data = {
			studyTime: 25,
			sessions: 4,
			breakTime: 5
		};
		setStudyTime(data.studyTime);
		setSessions(data.sessions);
		setBreakTime(data.breakTime);
	}

	// Fetch dei dati del pomodoro
	React.useEffect(() => {
		if (id) {
			getPomodoroData();
		}
		reset();
	}, [reset, id]);

	function calcTime() {
		const minutes = Math.floor(currentTime / 60);
		const seconds = currentTime % 60;
		return `${minutes < 10 ? "0" + minutes : minutes}:${seconds < 10 ? "0" + seconds : seconds}`;
	}

	function handleStart() {
		setIsPaused(false);
		setIsStarted(true);
		setCurrentTime(isStudying ? studyTime * 60 : breakTime * 60);
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
		return (
			<div className="d-flex flex-column align-items-center justify-content-center">
				<h1 style={{ fontSize: "100px" }}>{calcTime()}</h1>
				{isStarted && (
					<h1 style={{ fontSize: "50px" }}>
						Sessioni rimanenti: {remainingSessions}
					</h1>
				)}
				<Button
					variant="link"
					onClick={isStarted ? handleResume : handleStart}
				>
					{!isStarted ? " Start" : isPaused ? "Resume" : "Pause"}
				</Button>
				{isStarted && isPaused && (
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
				)}
			</div>
		);
	}

	return (
		<Container
			fluid
			className="vh-100 d-flex flex-column"
			style={{ backgroundColor: "rgb(240, 240, 240)" }}
		>
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
		</Container>
	);
}
