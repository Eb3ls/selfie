import Script from "next/script";
import { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
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
import "./MusicBar.css";
import { QueueListModal } from "./QueueListModal";
import { TitleBar } from "./TitleBar";
import "./colors.css";

const opts: YouTubeProps["opts"] = {
	// https://developers.google.com/youtube/player_parameters
	playerVars: {
		vq: "small", // Qualità video
		controls: 0, // Nascondi i controlli del lettore
		disablekb: 1, // Disabilita i tasti della tastiera
		enablejsapi: 0, // Abilita l'API JavaScript
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
			<div className="w-100 bg-primary-green p-3 my-3 rounded-pill d-flex flex-column align-items-center">
				<TitleBar videoTitleList={videoTitleList}></TitleBar>
				<label htmlFor="videoRange" className="form-label"></label>
				<input
					type="range"
					id="videoRange"
					className="form-range customRange"
					min={0}
					max={videoDuration}
					value={currentTime}
					onChange={handleProgressBarChange}
					onMouseDown={handleMouseDown}
					onMouseUp={handleMouseUp}
				/>
				<div
					className="d-flex justify-content-between w-100"
					style={{ height: "1px" }}
				>
					<p className="m-0">{formatTime(currentTime)}</p>
					<p className="m-0">{formatTime(videoDuration)}</p>
				</div>

				<div className="d-flex w-100">
					<div className="d-flex mx-auto">
						<Button variant="link" onClick={toggleLoop}>
							<FaArrowRotateRight className="color-brown"></FaArrowRotateRight>
						</Button>
						<Button
							variant="link"
							onClick={togglePlay}
							className="rounded-circle p-3"
						>
							{isPlaying ? (
								<FaPause className="color-brown"></FaPause>
							) : (
								<FaPlay className="color-brown"></FaPlay>
							)}
						</Button>
						<Button variant="link" onClick={handleEnd}>
							<FaAnglesRight className="color-brown"></FaAnglesRight>
						</Button>
					</div>
					<div className="d-flex">
						<Button variant="link" onClick={toggleVolume}>
							{hasVolume ? (
								<FaVolumeLow className="color-brown"></FaVolumeLow>
							) : (
								<FaVolumeXmark className="color-brown"></FaVolumeXmark>
							)}
						</Button>
						<Button variant="link">
							<QueueListModal
								videoList={videoList}
								setVideoList={setVideoList}
								videoTitleList={videoTitleList}
								setVideoTitleList={setVideoTitleList}
							>
								<FaPlus className="color-brown"></FaPlus>
							</QueueListModal>
						</Button>
					</div>
				</div>
			</div>
		</>
	);
}
