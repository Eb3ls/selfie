"use client";

import React from "react";
import { Button, Container, Form, InputGroup } from "react-bootstrap";
import { FaAnglesDown, FaAnglesUp } from "react-icons/fa6";
import { Sidebar } from "../components/Sidebar";
import { Coffee } from "./Animation/Coffee";
import { Tree } from "./Animation/Tree";
import "./Pomodoro.css";
import { MusicBar } from "./musicBar/MusicBar";

export default function Pomodoro() {
	const [isStudying, setIsStudying] = React.useState(true);
	const [isActive, setIsActive] = React.useState(false);
	const [currentTime, setCurrentTime] = React.useState(0);
	const [studyTime, setStudyTime] = React.useState(1);
	const [sessions, setSessions] = React.useState(1);
	const [breakTime, setBreakTime] = React.useState(1);
	const [isStarted, setIsStarted] = React.useState(false);

	React.useEffect(() => {
		if (isActive) {
			const interval = setInterval(() => {
				setCurrentTime(currentTime - 1);
				if (currentTime === 1) {
					setIsStudying(!isStudying);
					setIsActive(false);
				}
			}, 1000);
			return () => clearInterval(interval);
		}
	}, [isStudying, currentTime, isActive]);

	React.useEffect(() => {
		setCurrentTime(studyTime * 60);
	}, [studyTime]);

	function calcTime() {
		const minutes = Math.floor(currentTime / 60);
		const seconds = currentTime % 60;
		return `${minutes < 10 ? "0" + minutes : minutes}:${seconds < 10 ? "0" + seconds : seconds}`;
	}

	function handlePomodoroState() {
		setIsActive(!isActive);
		if (!isStarted) {
			setIsStarted(true);
			setCurrentTime(isStudying ? studyTime * 60 : breakTime * 60);
		}
	}

	function TimerBlock() {
		return (
			<div className="d-flex flex-column align-items-center justify-content-center">
				<h1>{calcTime()}</h1>
				<Button variant="link" onClick={handlePomodoroState}>
					{isActive ? "Pause" : isStarted ? "Resume" : " Start"}
				</Button>
			</div>
		);
	}

	function StudyTimeBlock() {
		return (
			<div className="d-flex flex-column m-3 align-items-center justify-content-center">
				<Button
					onClick={() => setStudyTime(Math.max(1, studyTime + 1))}
				>
					<FaAnglesUp className="icon"></FaAnglesUp>
				</Button>
				<Form.Label htmlFor="study-time" className="mt-2">
					Study Time
				</Form.Label>
				<InputGroup className="mb-2">
					<Form.Control
						id="study-time"
						type="number"
						min={1}
						value={studyTime}
						onChange={(e: any) =>
							setStudyTime(parseInt(e.target.value))
						}
						className="text-center"
					/>
				</InputGroup>
				<Button
					onClick={() => setStudyTime(Math.max(1, studyTime - 1))}
				>
					<FaAnglesDown className="icon"></FaAnglesDown>
				</Button>
			</div>
		);
	}

	function SessionBlock() {
		return (
			<div className="d-flex flex-column m-3 align-items-center justify-content-center">
				<Button onClick={() => setSessions(Math.max(1, sessions + 1))}>
					<FaAnglesUp className="icon"></FaAnglesUp>
				</Button>
				<Form.Label htmlFor="sessions" className="mt-2">
					Sessions
				</Form.Label>
				<InputGroup className="mb-2">
					<Form.Control
						id="sessions"
						type="number"
						className="text-center"
						value={sessions}
						min={1}
						onChange={(e: any) =>
							setSessions(parseInt(e.target.value))
						}
					/>
				</InputGroup>
				<Button onClick={() => setSessions(Math.max(1, sessions - 1))}>
					<FaAnglesDown className="icon"></FaAnglesDown>
				</Button>
			</div>
		);
	}

	function BreakTimeBlock() {
		return (
			<div className="d-flex flex-column m-3 align-items-center justify-content-center">
				<Button
					onClick={() => setBreakTime(Math.max(1, breakTime + 1))}
				>
					<FaAnglesUp className="icon"></FaAnglesUp>
				</Button>
				<Form.Label htmlFor="break-time" className="mt-2">
					Break Time
				</Form.Label>
				<InputGroup className="mb-2">
					<Form.Control
						id="break-time"
						type="number"
						min={1}
						value={breakTime}
						onChange={(e: any) =>
							setBreakTime(parseInt(e.target.value))
						}
						className="text-center"
					/>
				</InputGroup>
				<Button
					onClick={() => setBreakTime(Math.max(1, breakTime - 1))}
				>
					<FaAnglesDown className="icon"></FaAnglesDown>
				</Button>
			</div>
		);
	}

	function PomodoroSettings() {
		return (
			<div className="d-flex justify-content-center">
				<StudyTimeBlock></StudyTimeBlock>
				<SessionBlock></SessionBlock>
				<BreakTimeBlock></BreakTimeBlock>
			</div>
		);
	}

	return (
		<Container
			fluid
			className="vh-100 d-flex flex-column"
			style={{ backgroundColor: "rgb(240, 240, 240)" }}
		>
			<Sidebar></Sidebar>
			{/*{isPlaying ? <Tree></Tree> : <Coffee></Coffee>}*/}
			<TimerBlock></TimerBlock>
			<PomodoroSettings></PomodoroSettings>
			<MusicBar></MusicBar>
		</Container>
	);
}

// TODO: sistemare perdita del focus quando si modifica un form
