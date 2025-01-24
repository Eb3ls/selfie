import Script from "next/script";
import { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import {
	FaAnglesRight,
	FaArrowRotateRight,
	FaPause,
	FaPlay,
	FaPlus,
	FaVolumeHigh,
	FaVolumeLow,
	FaVolumeXmark
} from "react-icons/fa6";
import Youtube, { YouTubeProps } from "react-youtube";
import "./MusicBar.css";
import { QueueListModal } from "./QueueListModal";
import { TitleBar } from "./TitleBar";
import "./colors.css";

// Configurazione del player YouTube
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

// Funzione di utilità per formattare i secondi nel formato MM:SS
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
// Componente MusicBar - Player YouTube personalizzato con controlli di riproduzione
export function MusicBar() {
	// Stati relativi al player e al video
	const [player, setPlayer] = useState<any>(null); // Istanza del player YouTube
	const [videoDuration, setVideoDuration] = useState<number>(0); // Durata totale del video
	const [currentTime, setCurrentTime] = useState<number>(0); // Tempo di riproduzione corrente
	const [isPlaying, setIsPlaying] = useState<boolean>(false); // Stato di riproduzione

	// Stati relativi al volume
	const [showVolumeSlider, setShowVolumeSlider] = useState<boolean>(false); // Mostra/nascondi slider volume
	const [volume, setVolume] = useState<number>(50); // Livello del volume (0-100)

	// Stati dei controlli del player
	const [toLoop, setToLoop] = useState<boolean>(false); // Ripetizione video corrente
	const [isInteracting, setIsInteracting] = useState<boolean>(false); // Interazione con la barra di avanzamento

	// Stati della playlist
	const [videoList, setVideoList] = useState<string[]>([]); // Lista degli ID dei video
	const [videoTitleList, setVideoTitleList] = useState<string[]>([]); // Lista dei titoli dei video

	// Gestore evento quando il player YouTube è pronto
	function onReady(event: any) {
		const player = event.target;
		setPlayer(player);
		setVideoDuration(player.getDuration());
		player.setVolume(volume);
		if (isPlaying) {
			player.playVideo();
		}
	}

	// Alterna riproduzione/pausa
	function togglePlay() {
		if (videoList.length === 0) {
			return;
		}
		isPlaying ? player.pauseVideo() : player.playVideo();
		setIsPlaying(!isPlaying);
	}

	function toggleShowVolume() {
		setShowVolumeSlider(!showVolumeSlider)
	}

	// Alterna la ripetizione del video corrente
	function toggleLoop() {
		setToLoop(!toLoop);
	}

	// Gestori interazione barra di avanzamento
	function handleMouseDown() {
		setIsInteracting(true);
	}

	function handleMouseUp() {
		setIsInteracting(false);
	}

	// Gestore fine video
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

	// Gestore cambio posizione barra di avanzamento
	function handleProgressBarChange(event: any) {
		const newTime = parseFloat(event.target.value);
		setCurrentTime(newTime);
		player.seekTo(newTime, true);
		if (player.getPlayerState() === 5) {
			setIsPlaying(true);
		}
	}

	// Effect per aggiornare il tempo corrente durante la riproduzione
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

	// Effect per resettare lo stato del player quando la playlist è vuota
	useEffect(() => {
		if (videoList.length === 0) {
			setCurrentTime(0);
			setVideoDuration(0);
			setIsPlaying(false);
			setToLoop(false);
			setPlayer(null);
		}
	}, [videoList]);

	// Gestore cambio volume
	function handleVolumeChange(event: any) {
		const newVolume = parseInt(event.target.value);
		setVolume(newVolume);
		if (player) {
			player.setVolume(newVolume);
		}
	}

	function VolumeBarBlock() {
		return (
			<Button
				variant="link"
				onMouseEnter={toggleShowVolume}
				onMouseLeave={toggleShowVolume}
				className="d-flex align-items-center position-relative p-2"
			>
				<div className="d-flex align-items-center"
					style={{
						transition: 'all 0.3s ease',
						width: showVolumeSlider ? '160px' : '20px',
						overflow: 'hidden'
					}}>
					<FaVolumeLow
						className="color-brown"
						size={20}
						style={{ flexShrink: 0 }}
					/>
					<input
						type="range"
						className="form-range mx-2"
						style={{
							width: '100px',
							height: '4px',
							cursor: 'pointer'
						}}
						min={0}
						max={100}
						value={volume}
						onChange={handleVolumeChange}
					/>
					<FaVolumeHigh
						className="color-brown"
						size={20}
						style={{ flexShrink: 0 }}
					/>
				</div>
			</Button>
		)
	}

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
						{VolumeBarBlock()}
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
