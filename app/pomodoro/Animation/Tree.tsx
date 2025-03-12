import React, { useEffect, useMemo, useRef, useState } from "react";
import "./Tree.css";

interface TreeProps {
	time: number;
	started: boolean;
	paused: boolean;
	resetTrigger: number;
}

interface LeafConfig {
	id: number;
	className: string;
}

const leavesConfig: LeafConfig[] = [
	{ id: 1, className: "leaves-1" },
	{ id: 2, className: "leaves-2" },
	{ id: 3, className: "leaves-3" }
	// You can add more leaf or blossom parts here
];

export function Tree({ time, started, paused, resetTrigger }: TreeProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const [containerSize, setContainerSize] = useState(0);

	useEffect(() => {
		if (containerRef.current) {
			const updateSize = () => {
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

	const style = useMemo<React.CSSProperties>(() => {
		return {
			"--time": `${time}s`,
			animationPlayState: started && !paused ? "running" : "paused",
			"--containerSize": `${containerSize * 1.5}px`,
			"--vertical-offset": "30%"
		} as React.CSSProperties;
	}, [time, started, paused, containerSize]);

	return (
		<div
			key={resetTrigger}
			ref={containerRef}
			className="tree-container position-relative h-100"
		>
			{leavesConfig.map((leaf) => (
				<div
					key={leaf.id}
					className={`${leaf.className} position-absolute translate-middle`}
					style={style}
				></div>
			))}
			<div
				className="log position-absolute start-50 translate-middle"
				style={style}
			></div>
			<div
				className="oval-circle position-absolute start-50 translate-middle"
				style={style}
			></div>
			<div
				className="bottom-circle position-absolute start-50 translate-middle"
				style={style}
			></div>
		</div>
	);
}
