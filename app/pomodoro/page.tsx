"use client";

import React from "react";
import { Button, Container } from "react-bootstrap";
import { FaShareNodes } from "react-icons/fa6";
import { Sidebar } from "../components/Sidebar";
import { Coffee } from "./Animation/Coffee";
import { Tree } from "./Animation/Tree";
import { MusicBar } from "./MusicBar/MusicBar";
import "./Pomodoro.css";
import { Setting } from "./Setting/Setting";
import { ShareModal } from "./ShareModal";

export default function Pomodoro() {
	const [isStudying, setIsStudying] = React.useState(true);
	const [isPaused, setIsPaused] = React.useState(true);
	const [isStarted, setIsStarted] = React.useState(false);
	const [currentTime, setCurrentTime] = React.useState(0);
	const [studyTime, setStudyTime] = React.useState(1);
	const [breakTime, setBreakTime] = React.useState(1);
	const [sessions, setSessions] = React.useState(1);
	const [remainingSessions, setRemainingSessions] = React.useState(sessions);

	const reset = React.useCallback(() => {
		setIsPaused(true);
		setIsStarted(false);
		setIsStudying(true);
		setCurrentTime(studyTime * 60);
	}, [studyTime]);

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

	React.useEffect(() => {
		reset();
	}, [studyTime, sessions, breakTime, reset]);

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

	function TimerBlock() {
		return (
			<div className="d-flex flex-column align-items-center justify-content-center">
				<h1>{calcTime()}</h1>
				<Button
					variant="link"
					onClick={isStarted ? handleResume : handleStart}
				>
					{!isStarted ? " Start" : isPaused ? "Resume" : "Pause"}
				</Button>
			</div>
		);
	}

	return (
		<Container
			fluid
			className="vh-100 d-flex flex-column"
			style={{ backgroundColor: "rgb(240, 240, 240)" }}
		>
			<ShareModal
				studyTime={studyTime}
				sessions={sessions}
				breakTime={breakTime}
			>
				<FaShareNodes
					size={30}
					className="position-absolute top-0 end-0 m-5 z-3"
				/>
			</ShareModal>
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
			{isPaused && (
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
