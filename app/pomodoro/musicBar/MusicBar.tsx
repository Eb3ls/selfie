import Script from "next/script";
import { useEffect, useState } from "react";
import { Button, Container } from "react-bootstrap";
import {
	FaAnglesRight,
	FaArrowRotateRight,
	FaPause,
	FaPlay,
	FaPlus,
	FaVolumeLow,
	FaVolumeXmark
} from "react-icons/fa6";
import Youtube, { YouTubeProps } from "react-youtube";
import { QueueListModal } from "./QueueListModal";

const opts: YouTubeProps["opts"] = {
	// https://developers.google.com/youtube/player_parameters
	playerVars: {
		vq: "small", // Qualità video
		controls: 0, // Nascondi i controlli del lettore
		disablekb: 1, // Disabilita i tasti della tastiera
		enablejsapi: 1, // Abilita l'API JavaScript
		iv_load_policy: 3, // Nascondi le annotazioni
		loop: 0,
		modestbranding: 1, // Nascondi il pulsante YouTube
		playsinline: 1, // Riproduci video in linea
		rel: 0, // Nascondi video correlati
		showinfo: 0 // Nascondi informazioni video
	}
};

function formatTime(seconds: number) {
	const minutes = Math.floor(seconds / 60);
	const secs = Math.floor(seconds % 60);
	const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
	const formattedSeconds = secs < 10 ? `0${secs}` : secs;
	return `${formattedMinutes}:${formattedSeconds}`;
}

// Il browser deve supportare la funzione postMessage
// Supportato da i browser moderni ad eccezione di Internet Explorer 7
// Non utilizzata una playlist in quando vogliamo che sia una coda di riproduzione
// Utilizzandola andrebbe comunque ricaricato il componente dovendo eliminare il video corrente
export function MusicBar() {
	const [player, setPlayer] = useState<any>(null);
	const [videoDuration, setVideoDuration] = useState<number>(0);
	const [hasVolume, setHasVolume] = useState<boolean>(true);
	const [volume, setVolume] = useState<number>(50);
	const [currentTime, setCurrentTime] = useState<number>(0);
	const [isPlaying, setIsPlaying] = useState<boolean>(false);
	const [toLoop, setToLoop] = useState<boolean>(false);
	const [isInteracting, setIsInteracting] = useState<boolean>(false);
	const [videoList, setVideoList] = useState<string[]>([]);
	const [videoTitleList, setVideoTitleList] = useState<string[]>([]);

	function onReady(event: any) {
		const player = event.target;
		setPlayer(player);
		setVideoDuration(player.getDuration());
		player.setVolume(volume);
		if (isPlaying) {
			player.playVideo();
		}
	}

	function togglePlay() {
		if (videoList.length === 0) {
			return;
		}
		isPlaying ? player.pauseVideo() : player.playVideo();
		setIsPlaying(!isPlaying);
	}

	function toggleVolume() {
		if (videoList.length === 0) {
			return;
		}
		hasVolume ? player.mute() : player.unMute();
		setHasVolume(!hasVolume);
	}

	function toggleLoop() {
		setToLoop(!toLoop);
	}

	function handleMouseDown() {
		setIsInteracting(true);
	}

	function handleMouseUp() {
		setIsInteracting(false);
	}

	function handleEnd() {
		if (toLoop) {
			player.seekTo(0, true);
			if (!isPlaying) {
				player.pauseVideo();
			}
		} else {
			setVideoList(videoList.slice(1));
			setVideoTitleList(videoTitleList.slice(1));
		}
	}

	function handleProgressBarChange(event: any) {
		const newTime = parseFloat(event.target.value);
		setCurrentTime(newTime);
		player.seekTo(newTime, true);
		if (player.getPlayerState() === 5) {
			setIsPlaying(true);
		}
	}

	useEffect(() => {
		if (player) {
			// Imposta un intervallo per aggiornare il tempo corrente
			const interval = setInterval(() => {
				if (!isInteracting) {
					setCurrentTime(player.getCurrentTime());
				}
			}, 1000);
			return () => clearInterval(interval);
		}
	}, [player, isInteracting]);

	useEffect(() => {
		if (videoList.length === 0) {
			setCurrentTime(0);
			setVideoDuration(0);
			setIsPlaying(false);
			setHasVolume(true);
			setToLoop(false);
			setPlayer(null);
		}
	}, [videoList]);

	return (
		<>
			<Script
				src="https://www.youtube.com/iframe_api"
				strategy="afterInteractive"
			/>
			<div>
				{videoList.length !== 0 && (
					<Youtube
						videoId={videoList[0]}
						opts={opts}
						onReady={onReady}
						onEnd={handleEnd}
						className={"d-none"}
					></Youtube>
				)}
			</div>
			<Container className="vh-100 vw-100">
				<Container className="h-50 w-100 bg-danger rounded-pill d-flex flex-column align-items-center justify-content-center">
					<h3 className="mx-auto">
						{videoTitleList.length !== 0
							? videoTitleList[0]
							: "Nessun video in coda"}
					</h3>
					<label htmlFor="videoRange" className="form-label"></label>
					<input
						type="range"
						id="videoRange"
						className="form-range"
						min={0}
						max={videoDuration}
						value={currentTime}
						onChange={handleProgressBarChange}
						onMouseDown={handleMouseDown}
						onMouseUp={handleMouseUp}
					/>
					<Container className="d-flex justify-content-between">
						<p>{formatTime(currentTime)}</p>
						<p>{formatTime(videoDuration)}</p>
					</Container>

					<Container className="d-flex w-100 position-relative">
						<div className="d-flex flex-shrink-0 mx-auto">
							<Button variant="link" onClick={toggleLoop}>
								<FaArrowRotateRight
									fontSize={30}
									fill={toLoop ? "blue" : "green"}
								></FaArrowRotateRight>
							</Button>
							<Button variant="link" onClick={togglePlay}>
								{isPlaying ? (
									<FaPause fontSize={30}></FaPause>
								) : (
									<FaPlay fontSize={30}></FaPlay>
								)}
							</Button>
							<Button variant="link" onClick={handleEnd}>
								<FaAnglesRight fontSize={30}></FaAnglesRight>
							</Button>
						</div>
						<div className="d-flex position-absolute end-0">
							<Button variant="link" onClick={toggleVolume}>
								{hasVolume ? (
									<FaVolumeLow fontSize={30}></FaVolumeLow>
								) : (
									<FaVolumeXmark
										fontSize={30}
									></FaVolumeXmark>
								)}
							</Button>
							<Button variant="link">
								<QueueListModal
									videoList={videoList}
									setVideoList={setVideoList}
									videoTitleList={videoTitleList}
									setVideoTitleList={setVideoTitleList}
								>
									<FaPlus fontSize={30}></FaPlus>
								</QueueListModal>
							</Button>
						</div>
					</Container>
				</Container>
			</Container>
		</>
	);
}
