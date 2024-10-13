import "./Coffee.css";

interface TreeProps {
	time: number;
	started: boolean;
	paused: boolean;
}

export function Coffee({ time, started, paused }: TreeProps) {
	const animationType = started && !paused ? "infinite" : "1";
	const style = {
		"--animationType": `${animationType}`
	} as React.CSSProperties;

	return (
		<div className="position-relative h-50 w-100">
			<div className="top-cup-up position-absolute translate-middle"></div>
			<div className="top-cup-down position-absolute translate-middle"></div>
			<div className="main-cup position-absolute translate-middle"></div>
			<div className="bottom-cup position-absolute translate-middle"></div>
			<div className="coffee-circle position-absolute translate-middle"></div>
			<div
				className="steam steam-1 position-absolute"
				style={style}
			></div>
			<div
				className="steam steam-2 position-absolute"
				style={style}
			></div>
			<div
				className="steam steam-3 position-absolute"
				style={style}
			></div>
		</div>
	);
}
