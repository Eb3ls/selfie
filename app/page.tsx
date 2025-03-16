"use client";

import { greenColor } from "@/app/color_palette";
import Image from "next/image";
import Link from "next/link";
import {
	Button,
	Carousel,
	Col,
	Container,
	Nav,
	Navbar,
	Row
} from "react-bootstrap";

function NavbarComponent() {
	return (
		<Navbar expand="lg" className="py-3 bg-white shadow-sm" sticky="top">
			<Container>
				<Navbar.Brand href="#" className="d-flex align-items-center">
					<Image
						src="/Sloth.png"
						alt="Logo"
						height="50"
						width="110"
						className="d-inline-block align-text-top"
					/>
					<span
						className="ms-3 fs-3 fw-bold"
						style={{ color: greenColor }}
					>
						Selfie Calendar
					</span>
				</Navbar.Brand>
				<Navbar.Toggle aria-controls="basic-navbar-nav" />
				<Navbar.Collapse id="basic-navbar-nav">
					<Nav className="ms-auto">
						<Nav.Link href="/register" className="mx-2 fw-semibold">
							Registrati
						</Nav.Link>
						<Nav.Link href="/login" className="mx-2 fw-semibold">
							Accedi
						</Nav.Link>
						<Nav.Link href="#" className="mx-2 fw-semibold">
							Chi Siamo
						</Nav.Link>
						<Nav.Link href="#" className="mx-2 fw-semibold">
							Aiuto
						</Nav.Link>
					</Nav>
				</Navbar.Collapse>
			</Container>
		</Navbar>
	);
}

function HeroSection() {
	return (
		<div className="position-relative vh-100">
			<div
				className="overlay position-absolute w-100 h-100"
				style={{ backgroundColor: "rgba(0, 0, 0, 0.5)", zIndex: 1 }}
			></div>
			<Image
				src="/tmp_landing.jpg"
				alt="background"
				width={1920}
				height={1080}
				style={{
					objectFit: "cover",
					width: "100%",
					height: "100vh"
				}}
				priority={true}
				draggable={false}
			/>
			<Container
				className="position-absolute top-50 start-50 translate-middle text-center"
				style={{ zIndex: 2 }}
			>
				<h1 className="display-2 text-white fw-bold mb-4">
					Il Tuo Tempo,{" "}
					<span style={{ color: greenColor }}>La Tua Vita</span>
				</h1>
				<p className="lead text-white mb-5 fs-4">
					Organizza, pianifica e condividi i tuoi momenti importanti
				</p>
				<div className="d-flex justify-content-center gap-3">
					<Link href="/register">
						<Button
							variant="light"
							className="rounded-pill px-5 py-3 fw-bold shadow-lg"
							style={{
								backgroundColor: greenColor,
								color: "white",
								border: "none"
							}}
						>
							Inizia Gratuitamente
						</Button>
					</Link>
					<Button
						variant="outline-light"
						className="rounded-pill px-5 py-3 fw-bold"
					>
						Scopri di più
					</Button>
				</div>
			</Container>
		</div>
	);
}

function CarouselComponent() {
	return (
		<Carousel className="bg-dark py-5" interval={3000}>
			<Carousel.Item>
				<Container
					className="text-center text-white py-5"
					style={{ height: "400px" }}
				>
					<h2 className="display-4 mb-4">Organizza la Tua Vita</h2>
					<p className="lead mb-4">
						Gestisci i tuoi impegni in modo semplice ed efficace con
						il nostro calendario smart. Sincronizza tutti i tuoi
						dispositivi e non perdere mai un appuntamento
						importante.
					</p>
					<Button variant="outline-light" size="lg">
						Scopri di più
					</Button>
				</Container>
			</Carousel.Item>
			<Carousel.Item>
				<Container
					className="text-center text-white py-5"
					style={{ height: "400px" }}
				>
					<h2 className="display-4 mb-4">
						Condividi con il Tuo Team
					</h2>
					<p className="lead mb-4">
						Collabora facilmente con colleghi e amici. Pianifica
						riunioni, eventi e scadenze in modo collaborativo.
					</p>
					<Button variant="outline-light" size="lg">
						Prova Gratis
					</Button>
				</Container>
			</Carousel.Item>
			<Carousel.Item>
				<Container
					className="text-center text-white py-5"
					style={{ height: "400px" }}
				>
					<h2 className="display-4 mb-4">Sempre con Te</h2>
					<p className="lead mb-4">
						Accedi al tuo calendario ovunque tu sia. App mobile,
						desktop e web sempre sincronizzate.
					</p>
					<Button variant="outline-light" size="lg">
						Inizia Ora
					</Button>
				</Container>
			</Carousel.Item>
		</Carousel>
	);
}

function StatisticsSection() {
	return (
		<Container fluid className="bg-light py-5">
			<Row className="justify-content-center text-center g-4">
				{[
					{ number: "10k+", text: "Utenti Attivi" },
					{ number: "50k+", text: "Eventi Creati" },
					{ number: "99%", text: "Clienti Soddisfatti" },
					{ number: "24/7", text: "Supporto" }
				].map((stat, index) => (
					<Col key={index} md={3} sm={6}>
						<h2
							className="display-4 fw-bold"
							style={{ color: greenColor }}
						>
							{stat.number}
						</h2>
						<p className="text-muted fs-5">{stat.text}</p>
					</Col>
				))}
			</Row>
		</Container>
	);
}

function ReasonsComponent() {
	const features = [
		{
			icon: "calendar-check",
			title: "Gestione Intuitiva",
			description:
				"Interfaccia user-friendly per organizzare i tuoi impegni con facilità"
		},
		{
			icon: "people",
			title: "Collaborazione in Tempo Reale",
			description:
				"Condividi e sincronizza il tuo calendario con chi vuoi"
		},
		{
			icon: "bell",
			title: "Notifiche Intelligenti",
			description:
				"Ricevi promemoria personalizzati per ogni evento importante"
		}
	];

	return (
		<Container className="my-5 py-5">
			<h2 className="text-center display-4 mb-5 fw-bold">
				Perché Scegliere Selfie Calendar?
			</h2>
			<Row className="g-4">
				{features.map((feature, index) => (
					<Col key={index} md={4}>
						<div className="p-4 h-100 bg-white rounded-4 shadow-sm hover-lift">
							<div
								className="feature-icon-container mb-4 p-3 rounded-circle d-inline-block"
								style={{ backgroundColor: `${greenColor}20` }}
							>
								<i
									className={`bi bi-${feature.icon} display-4`}
									style={{ color: greenColor }}
								></i>
							</div>
							<h3 className="h4 mb-3 fw-bold">{feature.title}</h3>
							<p className="text-muted">{feature.description}</p>
						</div>
					</Col>
				))}
			</Row>
		</Container>
	);
}

function FooterComponent() {
	return (
		<footer className="bg-dark text-white py-4 mt-5">
			<Container>
				<Row className="align-items-center">
					<Col md={6} className="text-center text-md-start">
						<div className="d-flex align-items-center mb-3">
							<Image
								src="/Sloth.png"
								alt="Logo"
								height="40"
								width="88"
								className="d-inline-block"
							/>
							<span
								className="ms-2 fs-5"
								style={{ color: greenColor }}
							>
								Selfie Calendar
							</span>
						</div>
						<p className="small mb-0">
							© 2024 Selfie Calendar - Tutti i diritti riservati
						</p>
					</Col>
					<Col
						md={6}
						className="text-center text-md-end mt-3 mt-md-0"
					>
						<div className="mb-2">
							<Link
								href="#"
								className="text-decoration-none text-white mx-2"
							>
								Privacy
							</Link>
							<Link
								href="#"
								className="text-decoration-none text-white mx-2"
							>
								Termini
							</Link>
							<Link
								href="#"
								className="text-decoration-none text-white mx-2"
							>
								Contatti
							</Link>
						</div>
						<div>
							<Link href="#" className="text-white mx-2">
								<i className="bi bi-instagram fs-5"></i>
							</Link>
							<Link href="#" className="text-white mx-2">
								<i className="bi bi-facebook fs-5"></i>
							</Link>
							<Link href="#" className="text-white mx-2">
								<i className="bi bi-twitter fs-5"></i>
							</Link>
						</div>
					</Col>
				</Row>
			</Container>
		</footer>
	);
}

export default function LandingPage() {
	return (
		<main className="min-vh-100">
			<NavbarComponent />
			<HeroSection />
			<CarouselComponent />
			<StatisticsSection />
			<ReasonsComponent />
			<FooterComponent />
		</main>
	);
}
