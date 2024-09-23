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
		<Navbar bg="light" expand="lg">
			<Container className="d-flex justify-content-between">
				<Navbar.Brand
					href="#"
					className="fs-1 d-flex align-items-center"
				>
					<Image
						src="/Sloth.png"
						alt="Logo"
						width={100}
						height={100}
						className="d-inline-block"
					/>
					Selfie
				</Navbar.Brand>
				<Navbar.Toggle aria-controls="basic-navbar-nav" />
				<Navbar.Collapse id="basic-navbar-nav">
					<Nav className="ms-auto">
						<Nav.Link href="/register">Register</Nav.Link>
						<Nav.Link href="/login">Login</Nav.Link>
						<Nav.Link href="#">About</Nav.Link>
						<Nav.Link href="#">FAQ</Nav.Link>
					</Nav>
				</Navbar.Collapse>
			</Container>
		</Navbar>
	);
}

function CarouselComponent() {
	return (
		<Carousel className="bg-dark" interval={2000}>
			<Carousel.Item>
				<Container style={{ height: "500px", width: "500px" }}>
					<Image
						src="/Sloth.png"
						className="d-block"
						alt="Carousel1"
						height={500}
						width={500}
					/>
				</Container>
			</Carousel.Item>
			<Carousel.Item>
				<Container style={{ height: "500px", width: "500px" }}>
					<Image
						src="/Sloth.png"
						className="d-block"
						alt="Carousel2"
						height={500}
						width={500}
					/>
				</Container>
			</Carousel.Item>
			<Carousel.Item>
				<Container style={{ height: "500px", width: "500px" }}>
					<Image
						src="/Sloth.png"
						className="d-block"
						alt="Carousel2"
						height={500}
						width={500}
					/>
				</Container>
			</Carousel.Item>
		</Carousel>
	);
}

function ReasonsComponent() {
	return (
		<Container className="mt-3 text-center py-5">
			<Row className="gx-5">
				<Col>
					<h2>Motivo 1</h2>
					<p>
						Lorem ipsum dolor sit amet consectetur adipisicing elit.
					</p>
				</Col>
				<Col>
					<h2>Motivo 2</h2>
					<p>
						Lorem ipsum dolor sit amet consectetur adipisicing elit.
					</p>
				</Col>
				<Col>
					<h2>Motivo 3</h2>
					<p>
						Lorem ipsum dolor sit amet consectetur adipisicing elit.
					</p>
				</Col>
			</Row>
		</Container>
	);
}

function FooterComponent() {
	return (
		<footer className="bg-dark text-white pt-4">
			<Container>
				<Row>
					<Col md={6}>
						<h5>Contatti</h5>
						<p>Telefono: +39 123 456 789</p>
						<p>Email: info@tuaazienda.com</p>
						<p>Indirizzo: Via Esempio, 123, Roma, Italia</p>
					</Col>

					<Col md={6} className="text-md-end">
						<h5>Seguici</h5>
						<Link
							href="https://www.instagram.com"
							passHref={true}
							className="text-white me-2"
						>
							<i className="bi bi-instagram"></i>
						</Link>
						<Link
							href="https://www.facebook.com"
							passHref={true}
							className="text-white me-2"
						>
							<i className="bi bi-facebook"></i>
						</Link>
						<Link
							href="https://www.twitter.com"
							passHref={true}
							className="text-white me-2"
						>
							<i className="bi bi-twitter	"></i>
						</Link>
					</Col>
				</Row>
			</Container>
			<Container className="text-center py-3">
				<p className="mb-0">
					© 2024 Tua Azienda. Tutti i diritti riservati.
				</p>
			</Container>
		</footer>
	);
}

export default function LandingPage() {
	return (
		<main className="wh-100 vh-100">
			<NavbarComponent />
			<Container fluid className="position-relative p-0">
				<Image
					src="/tmp_landing.jpg"
					alt="background"
					width={1920}
					height={900}
					style={{
						filter: "blur(2px)",
						WebkitFilter: "blur(2px)",
						objectFit: "cover",
						width: "100%",
						height: "1000px"
					}}
					priority={true}
					draggable={false}
				/>
				<Container className="position-absolute top-50 start-50 translate-middle p-3 text-center">
					<h1 className="text-white">Cosa aspetti a iscriverti?</h1>
					<Link href={"/register"}>
						<Button
							className="rounded-5 text-white btn-lg"
							style={{ backgroundColor: greenColor }}
						>
							Fallo ora!
						</Button>
					</Link>
				</Container>
			</Container>
			<CarouselComponent />
			<ReasonsComponent />
			<FooterComponent />
		</main>
	);
}
