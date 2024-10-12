"use client";

import React from "react";
import { Button, Container } from "react-bootstrap";
import { Sidebar } from "../components/Sidebar";
import { Coffee } from "./Animation/Coffee";
import { Tree } from "./Animation/Tree";
import { MusicBar } from "./MusicBar/MusicBar";
import "./Pomodoro.css";
import { Setting } from "./Setting/Setting";

export default function Pomodoro() {
	const [isStudying, setIsStudying] = React.useState(true);
	const [isActive, setIsActive] = React.useState(false);
	const [isStarted, setIsStarted] = React.useState(false);
	const [currentTime, setCurrentTime] = React.useState(0);
	const [studyTime, setStudyTime] = React.useState(1);
	const [breakTime, setBreakTime] = React.useState(1);
	const [sessions, setSessions] = React.useState(1);
	const [remainingSessions, setRemainingSessions] = React.useState(sessions);

	function handleFinish() {
		if (remainingSessions === 1) {
			setIsActive(false);
			setIsStarted(false);
			setCurrentTime(studyTime * 60);
			setRemainingSessions(sessions);
		} else {
			setIsStudying(!isStudying);
			setCurrentTime(isStudying ? breakTime * 60 : studyTime * 60);
			if (!isStudying) {
				setRemainingSessions(remainingSessions - 1);
			}
		}
	}

	React.useEffect(() => {
		if (isActive) {
			const interval = setInterval(() => {
				if (currentTime === 1) {
					handleFinish();
				} else {
					setCurrentTime(currentTime - 1);
				}
			}, 50);
			return () => clearInterval(interval);
		}
	}, [isStudying, currentTime, isActive, remainingSessions]);

	React.useEffect(() => {
		setCurrentTime(studyTime * 60);
	}, [studyTime]);

	function calcTime() {
		const minutes = Math.floor(currentTime / 60);
		const seconds = currentTime % 60;
		return `${minutes < 10 ? "0" + minutes : minutes}:${seconds < 10 ? "0" + seconds : seconds}`;
	}

	function handleStart() {
		setIsActive(!isActive);
		setIsStarted(true);
		setCurrentTime(isStudying ? studyTime * 60 : breakTime * 60);
		setRemainingSessions(sessions);
	}

	function handleResume() {
		setIsActive(!isActive);
	}

	function TimerBlock() {
		return (
			<div className="d-flex flex-column align-items-center justify-content-center">
				<h1>{calcTime()}</h1>
				<Button
					variant="link"
					onClick={isStarted ? handleResume : handleStart}
				>
					{isActive ? "Pause" : isStarted ? "Resume" : " Start"}
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
			{/*{isStudying ? <Tree></Tree> : <Coffee></Coffee>}*/}
			<Sidebar></Sidebar>
			<TimerBlock></TimerBlock>
			{!isActive && (
				<div className="d-flex justify-content-center">
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
