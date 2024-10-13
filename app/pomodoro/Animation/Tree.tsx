import React, { useEffect, useState } from "react";
import "./Tree.css";

interface TreeProps {
	time: number;
	started: boolean;
	paused: boolean;
}

export function Tree({ time, started, paused }: TreeProps) {
	const [style, setStyle] = useState<React.CSSProperties>({
		"--time": `${time}s`,
		animationPlayState: started && !paused ? "running" : "paused"
	} as React.CSSProperties);

	useEffect(() => {
		const state = started && !paused ? "running" : "paused";
		setStyle({
			"--time": `${time}s`,
			animationPlayState: state
		} as React.CSSProperties);
	}, [time, started, paused]);

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
			<div className="log position-absolute start-50 translate-middle"></div>
			<div className="oval-circle position-absolute start-50 translate-middle"></div>
			<div className="bottom-circle position-absolute start-50 translate-middle"></div>
		</div>
	);
}
