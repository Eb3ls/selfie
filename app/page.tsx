"use client";

import Image from "next/image";

const color = "rgb(64, 175, 12)";

export default function Home() {
	const navbar = () => {
		return (
			<div className="navbar navbar-expand-lg navbar-light bg-light">
				<div className="container d-flex justify-content-between">
					<a className="navbar-brand fs-1 d-flex align-items-center">
						<Image
							src="/Sloth.png"
							alt="Logo"
							width={100}
							height={100}
							className="d-inline-block"
						/>
						Selfie
					</a>
					<ul className="nav justify-content-end">
						<li className="nav-item">
							<a className="nav-link active" href="/register">
								Register
							</a>
						</li>
						<li className="nav-item">
							<a className="nav-link" href="/login">
								Login
							</a>
						</li>
						<li className="nav-item">
							<a className="nav-link" href="#">
								About
							</a>
						</li>
						<li className="nav-item">
							<a className="nav-link" href="#">
								FAQ
							</a>
						</li>
					</ul>
				</div>
			</div>
		);
	};

	const carousel = () => {
		return (
			<div
				id="carouselExampleSlidesOnly"
				className="carousel slide"
				data-bs-ride="carousel"
			>
				<div className="carousel-inner">
					<div className="carousel-item active">
						<Image
							src="/Sloth.png"
							className="d-block w-100"
							alt="..."
							layout="fill"
						/>
					</div>
					<div className="carousel-item">
						<Image
							src="/Sloth.png"
							className="d-block w-100"
							alt="..."
							layout="fill"
						/>
					</div>
					<div className="carousel-item">
						<Image
							src="/Sloth.png."
							className="d-block w-100"
							alt="..."
							layout="fill"
						/>
					</div>
				</div>
			</div>
		);
	};

	const reasons = () => {
		return (
			<div className="container mt-3 text-center py-5">
				<div className="row gx-5">
					<div className="col">
						<h2>Motivo 1</h2>
						<p>
							Lorem ipsum dolor sit amet consectetur adipisicing
							elit.
						</p>
					</div>
					<div className="col">
						<h2>Motivo 2</h2>
						<p>
							Lorem ipsum dolor sit amet consectetur adipisicing
							elit.
						</p>
					</div>
					<div className="col">
						<h2>Motivo 3</h2>
						<p>
							Lorem ipsum dolor sit amet consectetur adipisicing
							elit.
						</p>
					</div>
				</div>
			</div>
		);
	};

	const footer = () => {
		return (
			<footer className="bg-dark text-white pt-4">
				<div className="container">
					<div className="row">
						<div className="col-md-6">
							<h5>Contatti</h5>
							<p>Telefono: +39 123 456 789</p>
							<p>Email: info@tuaazienda.com</p>
							<p>Indirizzo: Via Esempio, 123, Roma, Italia</p>
						</div>

						<div className="col-md-6 text-md-end">
							<h5>Seguici</h5>
							<a
								href="https://www.instagram.com"
								className="text-white me-2"
							>
								<i className="bi bi-instagram"></i>
							</a>
							<a
								href="https://www.facebook.com"
								className="text-white me-2"
							>
								<i className="bi bi-facebook"></i>
							</a>
							<a
								href="https://www.twitter.com"
								className="text-white me-2"
							>
								<i className="bi bi-twitter	"></i>{" "}
								{/* Twitter X non va*/}
							</a>
						</div>
					</div>
				</div>
				<div className="text-center py-3">
					<p className="mb-0">
						© 2024 Tua Azienda. Tutti i diritti riservati.
					</p>
				</div>
			</footer>
		);
	};

	return (
		<main className="wh-100 vh-100">
			{navbar()}
			<div className="container-fluid position-relative p-0">
				<Image
					src="/tmp_landing.jpg"
					alt="background"
					objectFit="cover"
					width={1920}
					height={900}
					style={{
						filter: "blur(2px)",
						WebkitFilter: "blur(2px)"
					}}
				/>
				<div className="position-absolute top-50 start-50 translate-middle p-3 text-center">
					<h1 className="text-white">Cosa aspetti a iscriverti?</h1>
					<button
						className="btn rounded-5 text-white btn-lg"
						style={{ backgroundColor: color }}
						onClick={() => {
							window.location.href = "/register";
						}}
					>
						Fallo ora!
					</button>
				</div>
			</div>
			{carousel()}
			{reasons()}
			{footer()}

			{/* Navbar registrati accedi scopri di piú FAQ? (di solito nella stessa pagina) */}
			{/* Immagine leggermente in blur con bottone per iscriversi */}
			{/* Tre motivi per sceglire questa app */}
			{/* Carousel con immagini dell'app */}
			{/* Footer con 
				- Social media
				- Contatti
				- Chi siamo
				- Copyright
			*/}
		</main>
	);
}
