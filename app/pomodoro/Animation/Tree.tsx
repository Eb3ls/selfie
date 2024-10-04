import "./Tree.css";

export function Tree() {
	return (
		<div className="d-flex w-100 h-100 align-items-center justify-content-center">
			<div className="position-relative w-100 h-100">
				<div className="leaves-1 position-absolute translate-middle"></div>
				<div className="leaves-2 position-absolute translate-middle"></div>
				<div className="leaves-3 position-absolute translate-middle"></div>
				<div className="log position-absolute translate-middle"></div>
				<div className="oval-circle position-absolute top-50 start-50 translate-middle"></div>
				<div className="bottom-circle position-absolute top-50 start-50 translate-middle"></div>
			</div>
		</div>
	);
}
