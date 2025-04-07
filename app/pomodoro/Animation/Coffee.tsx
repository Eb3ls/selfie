import React, { useEffect, useMemo, useRef, useState } from "react";
import "./Coffee.css";

export function Coffee({ show }: { show: boolean }) {
	// New container reference and state for dynamic sizing
	const containerRef = useRef<HTMLDivElement>(null);
	const [containerSize, setContainerSize] = useState(0);

	useEffect(() => {
		if (containerRef.current) {
			const updateSize = () => {
				if (!containerRef) return;
				const { width, height } =
					containerRef.current!.getBoundingClientRect();
				setContainerSize(Math.min(width, height));
			};
			updateSize();
			const observer = new ResizeObserver(updateSize);
			observer.observe(containerRef.current);
			return () => observer.disconnect();
		}
	}, []);

	// Pass computed containerSize and animation type to CSS
	const style = useMemo<React.CSSProperties>(
		() =>
			({
				"--animationType": "infinite",
				"--containerSize": `${containerSize * 1.5}px`
			}) as React.CSSProperties,
		[containerSize]
	);

	return (
		<div
			ref={containerRef}
			className={`position-relative w-100 h-100 ${show ? "" : "hidden"}`}
			style={style}
		>
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
