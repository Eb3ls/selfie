"use client";

import { Container } from "react-bootstrap";
import { Sidebar } from "../components/Sidebar";
import { MusicBar } from "./musicBar/MusicBar";

export default function Pomodoro() {
	return (
		<Container
			fluid
			className="vh-100 w-100"
			style={{ backgroundColor: "rgb(240, 240, 240)" }}
		>
			<Sidebar></Sidebar>
			<div className="d-flex flex-column align-items-center">
				<div>prova</div>
				<div>prova</div>
				<div>prova</div>
			</div>
			<MusicBar></MusicBar>
		</Container>
	);
}
