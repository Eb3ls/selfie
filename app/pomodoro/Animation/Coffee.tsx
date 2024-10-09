import "./Coffee.css";

export function Coffee() {
	return (
		<div className="position-relative h-50 w-100">
			<div className="top-cup-up position-absolute translate-middle"></div>
			<div className="top-cup-down position-absolute translate-middle"></div>
			<div className="main-cup position-absolute translate-middle"></div>
			<div className="bottom-cup position-absolute translate-middle"></div>
			<div className="coffee-circle position-absolute translate-middle"></div>
			<div className="steam steam-1 position-absolute"></div>
			<div className="steam steam-2 position-absolute"></div>
			<div className="steam steam-3 position-absolute"></div>
		</div>
	);
}
