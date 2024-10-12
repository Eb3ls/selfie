import { useEffect, useRef, useState } from "react";
import "./MusicBar.css";

export function TitleBar({ videoTitleList }: { videoTitleList: string[] }) {
	const parentRef = useRef<HTMLDivElement | null>(null);
	const childRef = useRef<HTMLHeadingElement | null>(null);
	const [isOverflowingX, setIsOverflowingX] = useState(false);
	const [animationDuration, setAnimationDuration] = useState(0);
	const [animationDistance, setAnimationDistance] = useState(0);

	const checkOverflow = () => {
		if (parentRef.current && childRef.current) {
			const parentWidth = parentRef.current.clientWidth;
			const childWidth = childRef.current.scrollWidth;
			const isOverflowing = childWidth > parentWidth;
			setIsOverflowingX(isOverflowing);
			if (isOverflowing) {
				const distance = childWidth - parentWidth + 100;
				setAnimationDistance(distance);
				setAnimationDuration(distance / 50);
			}
		}
	};

	useEffect(() => {
		checkOverflow();
		window.addEventListener("resize", checkOverflow);
		return () => {
			window.removeEventListener("resize", checkOverflow);
		};
	}, [videoTitleList]);

	return (
		<div
			ref={parentRef}
			className="mx-3 overflow-x-hidden"
			style={{ width: "90%" }}
		>
			<h3
				ref={childRef}
				className={`text-nowrap m-0 ${
					isOverflowingX ? "scrollText" : "text-center"
				}`}
				style={
					{
						"--animationDuration": `${animationDuration}s`,
						"--scrollDistance": `${animationDistance}px`
					} as any
				}
			>
				{videoTitleList.length !== 0
					? videoTitleList[0]
					: "Nessun video"}
			</h3>
		</div>
	);
}
