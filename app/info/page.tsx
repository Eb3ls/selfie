"use client";

import { greenColor } from "@/app/color_palette";
import Image from "next/image";
import Link from "next/link";
import { Card, Col, Container, Nav, Navbar, Row } from "react-bootstrap";
import { FaEnvelope, FaGithub } from "react-icons/fa";
import { FaBars } from "react-icons/fa6";

interface DeveloperProps {
	name: string;
	email: string;
	links: {
		github?: string;
	};
}

function NavbarComponent() {
	return (
		<Navbar
			expand="md"
			className="py-3 fixed-top bg-white"
			style={{ boxShadow: "0 2px 15px rgba(0,0,0,0.04)" }}
		>
			<Container>
				<Navbar.Brand href="/" className="d-flex align-items-center">
					<Image
						src="/Sloth.png"
						alt="Logo"
						height="45"
						width="100"
						className="d-inline-block align-text-top"
						style={{ transition: "transform 0.2s" }}
						onMouseOver={(e) =>
							(e.currentTarget.style.transform = "scale(1.05)")
						}
						onMouseOut={(e) =>
							(e.currentTarget.style.transform = "scale(1)")
						}
					/>
					<span
						className="ms-3 fs-4 fw-bold"
						style={{ color: greenColor }}
					>
						Selfie Calendar
					</span>
				</Navbar.Brand>
				<Navbar.Toggle
					className="border-0 p-0 focus-ring"
					style={
						{
							"--bs-focus-ring-color": "none"
						} as React.CSSProperties
					}
				>
					<FaBars size={25} style={{ color: greenColor }} />
				</Navbar.Toggle>
				<Navbar.Collapse id="basic-navbar-nav">
					<Nav className="ms-auto gap-3 mt-3 mt-md-0">
						<Link
							href="/register"
							className="btn btn-outline-dark rounded-pill px-4 fw-semibold"
							style={{ transition: "all 0.2s" }}
						>
							Registrati
						</Link>
						<Link
							href="/login"
							className="btn rounded-pill px-4 fw-semibold text-white"
							style={{
								backgroundColor: greenColor,
								transition: "all 0.2s"
							}}
						>
							Accedi
						</Link>
					</Nav>
				</Navbar.Collapse>
			</Container>
		</Navbar>
	);
}

function DeveloperCard({ name, email, links }: DeveloperProps) {
	const initials = name
		.split(" ")
		.map((n) => n[0])
		.join("")
		.toUpperCase();

	return (
		<Card className="border-0 shadow rounded-4 h-100">
			<div
				className="position-absolute"
				style={{
					top: 0,
					left: "50%",
					transform: "translateX(-50%)",
					height: "4px",
					width: "60%",
					backgroundColor: greenColor,
					borderRadius: "4px 4px 0 0"
				}}
			/>
			<Card.Body className="d-flex flex-column align-items-center p-4">
				<div
					className="rounded-circle mb-4 d-flex align-items-center justify-content-center"
					style={{
						width: "100px",
						height: "100px"
					}}
				>
					<span className="display-5 fw-bold text-primary">
						{initials}
					</span>
				</div>

				<h2 className="h3 fw-bold mb-1 text-center">{name}</h2>
				<div className="text-center mb-3">
					<span
						className="badge rounded-pill px-3 py-2 mt-2"
						style={{
							color: greenColor
						}}
					>
						Developer
					</span>
				</div>

				<div className="d-flex gap-3 mt-3 mb-2">
					{links.github && (
						<a
							href={links.github}
							className="btn btn-dark d-flex align-items-center justify-content-center"
							style={{
								width: "40px",
								height: "40px",
								borderRadius: "50%",
								padding: 0
							}}
							aria-label={`${name}'s GitHub`}
						>
							<FaGithub size={18} />
						</a>
					)}
					<a
						href={`mailto:${email}`}
						className="btn btn-danger d-flex align-items-center justify-content-center"
						style={{
							width: "40px",
							height: "40px",
							borderRadius: "50%",
							padding: 0
						}}
						aria-label={`Email ${name}`}
					>
						<FaEnvelope size={18} />
					</a>
				</div>

				<div className="text-center mt-3 small text-muted">
					<p className="mb-0">{email}</p>
				</div>
			</Card.Body>
		</Card>
	);
}

export default function InfoPage() {
	const developers: DeveloperProps[] = [
		{
			name: "Leonardo Berselli",
			email: "leonardo.berselli@studio.unibo.it",
			links: {
				github: "https://github.com/Eb3ls"
			}
		},
		{
			name: "Francesco Tomba",
			email: "francesco.tomba2@studio.unibo.it",
			links: {
				github: "https://github.com/GitFraT"
			}
		},
		{
			name: "Daniele Vito Ardito",
			email: "danielevito.ardito@studio.unibo.it",
			links: {
				github: "https://github.com/danielevardito"
			}
		}
	];

	return (
		<main className="dvh-100 overflow-y-auto">
			<NavbarComponent />
			<Container style={{ paddingTop: "120px" }}>
				<h1 className="fw-bold mb-4 text-center">Il Nostro Team</h1>

				<Row className="g-4 justify-content-center">
					{developers.map((dev, index) => (
						<Col key={index} md={6} lg={4}>
							<DeveloperCard {...dev} />
						</Col>
					))}
				</Row>

				<div className="text-center mt-5">
					<p className="text-muted">
						<Link href="/" className="text-decoration-none">
							Torna alla home
						</Link>
					</p>
				</div>
			</Container>
		</main>
	);
}
