import React, { useEffect, useRef } from "react";
import "./Tree.css";

interface TreeProps {
	time: number;
	started: boolean;
	paused: boolean;
}

export function Tree({ time, started, paused }: TreeProps) {
	const state = started && !paused ? "running" : "paused";
	const style = {
		"--time": `${time}s`,
		animationPlayState: state
	} as React.CSSProperties;

	return (
		<div className="position-relative h-100">
			<div
				className="leaves-1 position-absolute translate-middle"
				style={style}
			></div>
			<div
				className="leaves-2 position-absolute translate-middle"
				style={style}
			></div>
			<div
				className="leaves-3 position-absolute translate-middle"
				style={style}
			></div>
			<div className="log position-absolute translate-middle"></div>
			<div className="oval-circle position-absolute top-50 start-50 translate-middle"></div>
			<div className="bottom-circle position-absolute top-50 start-50 translate-middle"></div>
		</div>
	);
}
