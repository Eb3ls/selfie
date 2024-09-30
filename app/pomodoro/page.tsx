"use client";

import { Container } from "react-bootstrap";
import { MusicBar } from "./musicBar/MusicBar";

export default function Pomodoro() {
	return (
		<>
			<Container className="d-flex align-items-center justify-content-center h-100 mt-5">
				<MusicBar source="https://www.youtube.com/watch?v=EOHh_OrMbzw"></MusicBar>
			</Container>
		</>
	);
}
