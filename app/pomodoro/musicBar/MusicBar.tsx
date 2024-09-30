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

// Il browser deve supportare la funzione postMessage
// Supportato da i browser moderni ad eccezione di Internet Explorer 7
export function MusicBar({ source }: { source: string }) {
	if (source) {
		source = source.replace(
			// Correggi funzione
			"https://www.youtube.com/watch?v=",
			"https://www.youtube.com/embed/"
		);
	}

	const [player, setPlayer] = useState<any>(null);
	const [videoTitle, setVideoTitle] = useState<string>("");
	const [videoDuration, setVideoDuration] = useState<number>(0);
	const [hasVolume, setHasVolume] = useState<boolean>(true);
	const [volume, setVolume] = useState<number>(50);
	const [currentTime, setCurrentTime] = useState<number>(0);
	const [isPlaying, setIsPlaying] = useState<boolean>(false);
	const [toLoop, setToLoop] = useState<boolean>(false);
	const [isInteracting, setIsInteracting] = useState<boolean>(false);

	const onReady = (event: any) => {
		const player = event.target;
		const videoData = player.getVideoData();

		setVideoTitle(videoData.title);
		setVideoDuration(player.getDuration());
		player.setVolume(volume);

		setPlayer(player);
	};

	source = "EOHh_OrMbzw";

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

	function toggleVideo() {
		isPlaying ? player.pauseVideo() : player.playVideo();
		setIsPlaying(!isPlaying);
	}

	function toggleVolume() {
		hasVolume ? player.mute() : player.unMute();
		setHasVolume(!hasVolume);
	}

	function toggleLoop() {
		setToLoop(!toLoop);
	}

	const handleMouseDown = () => {
		setIsInteracting(true);
	};

	const handleMouseUp = () => {
		setIsInteracting(false);
	};

	const handleProgressBarChange = (
		e: React.ChangeEvent<HTMLInputElement>
	) => {
		const newTime = parseFloat(e.target.value); // Ottieni il nuovo valore dalla barra
		setCurrentTime(newTime); // Aggiorna il tempo corrente
		player.seekTo(newTime, true); // Sposta il video al nuovo punto
		if (!isPlaying) {
			player.pauseVideo();
		}
	};

	// Aggiorna il tempo corrente ogni secondo
	useEffect(() => {
		if (player) {
			// Imposta un intervallo per aggiornare il tempo corrente
			const interval = setInterval(() => {
				if (!isInteracting) {
					setCurrentTime(player.getCurrentTime());
				}
			}, 1000); // Ogni secondo
			return () => clearInterval(interval); // Cancella l'intervallo al dismount
		}
	}, [player, isInteracting]); // L'effetto si esegue ogni volta che cambia YTPlayer

	return (
		<>
			<Script
				src="https://www.youtube.com/iframe_api"
				strategy="afterInteractive"
			/>
			<div>
				<Youtube
					videoId={source}
					opts={opts}
					onReady={onReady}
					className={"-none"}
				></Youtube>
			</div>
			<Container className="vh-100 vw-100">
				<Container className="h-50 w-100 bg-danger rounded-pill d-flex flex-column">
					<h3 className="mx-auto">
						{videoTitle ? videoTitle : "Caricamento..."}
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

					<Container className="d-flex position-relative">
						<Container className="flex-grow-1 d-flex justify-content-center">
							<Button variant="link" onClick={toggleLoop}>
								<FaArrowRotateRight
									fontSize={30}
									fill={toLoop ? "blue" : "green"}
								></FaArrowRotateRight>
							</Button>
							<Button variant="link" onClick={toggleVideo}>
								{isPlaying ? (
									<FaPause fontSize={30}></FaPause>
								) : (
									<FaPlay fontSize={30}></FaPlay>
								)}
							</Button>
							<Button variant="link">
								<FaAnglesRight fontSize={30}></FaAnglesRight>
							</Button>
						</Container>
						<Container className="">
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
								<QueueListModal>
									<FaPlus fontSize={30}></FaPlus>
								</QueueListModal>
							</Button>
						</Container>
					</Container>
				</Container>
			</Container>
		</>
	);
}
