import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import { Button } from "react-bootstrap";
import { FaTimes } from "react-icons/fa";
import {
	FaAnglesRight,
	FaArrowRotateRight,
	FaPause,
	FaPlay,
	FaVolumeHigh,
	FaVolumeLow
} from "react-icons/fa6";
import Youtube, { YouTubeProps } from "react-youtube";
import { MusicInput } from "./MusicInput";
import { TitleBar } from "./TitleBar";

// Configurazione del player.current YouTube
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
// Componente MusicBar - player YouTube personalizzato con controlli di riproduzione
export function MusicView() {
	// Stati relativi al player e al video
	const player = useRef<any>(null); // Riferimento al player YouTube
	const [videoDuration, setVideoDuration] = useState<number>(0); // Durata totale del video
	const [currentTime, setCurrentTime] = useState<number>(0); // Tempo di riproduzione corrente
	const [isPlaying, setIsPlaying] = useState<boolean>(false); // Stato di riproduzione

	// Stati relativi al volume
	const [showVolumeSlider, setShowVolumeSlider] = useState<boolean>(false); // Mostra/nascondi slider volume
	const [volume, setVolume] = useState<number>(50); // Livello del volume

	// Stati dei controlli del player
	const [toLoop, setToLoop] = useState<boolean>(false); // Ripetizione video corrente
	const isInteracting = useRef<boolean>(false); // Stato di interazione con la barra di avanzamento

	// Stati della playlist
	const [videoList, setVideoList] = useState<string[]>([]); // Lista degli ID dei video
	const [videoTitleList, setVideoTitleList] = useState<string[]>([]); // Lista dei titoli dei video

	//

	// Gestore evento quando il player YouTube è pronto
	function onReady(event: any) {
		player.current = event.target;
		setVideoDuration(player.current.getDuration());
		player.current.setVolume(volume);
		if (isPlaying) {
			player.current.playVideo();
		}
	}

	// Alterna riproduzione/pausa
	function togglePlay() {
		if (videoList.length === 0) {
			return;
		}
		isPlaying ? player.current.pauseVideo() : player.current.playVideo();
		setIsPlaying(!isPlaying);
	}

	function toggleShowVolume() {
		setShowVolumeSlider(!showVolumeSlider);
	}

	// Alterna la ripetizione del video corrente
	function toggleLoop() {
		setToLoop(!toLoop);
	}

	// Gestori interazione barra di avanzamento
	function handleMouseDown() {
		isInteracting.current = true;
	}

	function handleMouseUp() {
		isInteracting.current = false;
	}

	// Gestore fine video
	function handleEnd() {
		if (toLoop) {
			player.current.seekTo(0, true);
			if (!isPlaying) {
				player.current.pauseVideo();
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
		player.current.seekTo(newTime, true);
		if (player.current.getPlayerState() === 5) {
			setIsPlaying(true);
		}
	}

	// Effect per aggiornare il tempo corrente durante la riproduzione
	useEffect(() => {
		// Imposta un intervallo per aggiornare il tempo corrente
		const interval = setInterval(() => {
			if (player.current && !isInteracting.current) {
				const ct = player.current.getCurrentTime();
				setCurrentTime(ct);
			}
		}, 1000);
		return () => clearInterval(interval);
	}, []);

	// Effect per resettare lo stato del player.current quando la playlist è vuota
	useEffect(() => {
		if (videoList.length === 0) {
			setCurrentTime(0);
			setVideoDuration(0);
			setIsPlaying(false);
			setToLoop(false);
			player.current = null;
		}
	}, [videoList]);

	// Gestore cambio volume
	function handleVolumeChange(event: any) {
		const newVolume = parseInt(event.target.value);
		setVolume(newVolume);
		if (player.current) {
			player.current.setVolume(newVolume);
		}
	}

	// Rimuove un video dalla coda
	function handleRemoveVideo(index: number) {
		setVideoTitleList(videoTitleList.filter((_, i) => i !== index));
		setVideoList(videoList.filter((_, i) => i !== index));
	}

	// Renderizza un singolo elemento della lista video
	function videoItem(videoTitle: string, index: number) {
		return (
			<div
				key={index}
				className="d-flex justify-content-between align-items-center mb-2 p-2 bg-light rounded hover-shadow"
				style={{
					transition: "all 0.2s ease",
					cursor: "default"
				}}
			>
				<div className="d-flex align-items-center flex-grow-1 me-3">
					<span className="me-3 text-muted">{index + 1}.</span>
					<span className="text-truncate">{videoTitle}</span>
				</div>
				<Button
					variant="link"
					className="bg-danger rounded-circle p-1 d-flex align-items-center justify-content-center"
					onClick={() => handleRemoveVideo(index)}
					title="Rimuovi video"
				>
					<FaTimes className="text-white" size={20} />
				</Button>
			</div>
		);
	}

	function VolumeBarBlock() {
		return (
			<Button
				variant="link"
				onMouseEnter={toggleShowVolume}
				onMouseLeave={toggleShowVolume}
				className="d-flex align-items-center position-relative p-2"
			>
				<div
					className="d-flex align-items-center"
					style={{
						transition: "all 0.3s ease",
						width: showVolumeSlider ? "160px" : "20px",
						overflow: "hidden"
					}}
				>
					<FaVolumeLow
						className="color-brown"
						size={20}
						style={{ flexShrink: 0 }}
					/>
					<input
						type="range"
						className="form-range mx-2"
						style={{
							width: "100px",
							height: "4px",
							cursor: "pointer"
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
		);
	}

	return (
		<div className="container-sm d-flex flex-column h-100">
			<Script
				src="https://www.youtube.com/iframe_api"
				strategy="afterInteractive"
			/>
			<MusicInput
				videoList={videoList}
				setVideoList={setVideoList}
				videoTitleList={videoTitleList}
				setVideoTitleList={setVideoTitleList}
			/>
			<div className="mt-4">
				<div className="d-flex align-items-center mb-3">
					<h5 className="m-0 fw-bold text-secondary">Queue</h5>
					<span className="ms-2 badge bg-primary rounded-pill">
						{videoTitleList.length}
					</span>
				</div>
				<div
					className="overflow-y-auto"
					style={{
						maxHeight: "60vh",
						scrollbarWidth: "none"
					}}
				>
					{videoTitleList.length > 0 ? (
						videoTitleList.map((video, index) =>
							videoItem(video, index)
						)
					) : (
						<p className="text-muted text-center p-3">
							No videos in queue
						</p>
					)}
				</div>
			</div>
			<div className="flex-grow-1"></div>
			{videoList.length !== 0 && (
				<>
					<div style={{ pointerEvents: "none" }}>
						<Youtube
							videoId={videoList[0]}
							opts={opts}
							onReady={onReady}
							onEnd={handleEnd}
							className="d-none"
						/>
					</div>
					<div className="w-100 bg-primary-green p-3 my-5 rounded-pill d-flex flex-column align-items-center">
						<TitleBar videoTitleList={videoTitleList}></TitleBar>
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
						<div className="d-flex justify-content-between w-100">
							<p className="m-0">{formatTime(currentTime)}</p>
							<p className="m-0">{formatTime(videoDuration)}</p>
						</div>

						<div className="d-flex w-100">
							<div className="d-flex align-self-center position-absolute">
								{VolumeBarBlock()}
							</div>
							<div className="d-flex mx-auto">
								<Button variant="link" onClick={toggleLoop}>
									<FaArrowRotateRight
										size={20}
										className={
											toLoop
												? "text-primary"
												: "text-muted"
										}
									></FaArrowRotateRight>
								</Button>
								<Button
									variant="link"
									onClick={togglePlay}
									className="rounded-circle p-3"
								>
									{isPlaying ? (
										<FaPause
											className="color-brown"
											size={20}
										></FaPause>
									) : (
										<FaPlay
											className="color-brown"
											size={20}
										></FaPlay>
									)}
								</Button>
								<Button variant="link" onClick={handleEnd}>
									<FaAnglesRight
										className="color-brown"
										size={20}
									></FaAnglesRight>
								</Button>
							</div>
						</div>
					</div>
				</>
			)}
		</div>
	);
}
