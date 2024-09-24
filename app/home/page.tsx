import Link from "next/link";
import { Button, Col, Container, Row } from "react-bootstrap";

function NavbarComponent() {
	return (
		<Container
			fluid
			className="mt-5 d-flex justify-content-between text-center"
		>
			<div className="d-flex flex-row ms-3">
				<i className="bi bi-person fs-1 me-2"></i>
				<div className="d-flex flex-column">
					<div className="fs-4">Daniele Vito Ardito</div>
					<div>panecondito@gmail.com</div>
				</div>
			</div>
			<div className="mx-5 d-flex flex-row align-items-center">
				<i className="bi bi-bell fs-1 me-3"></i>
				<i className="bi bi-telegram fs-1 me-3"></i>
				<h2>Selfie</h2>
			</div>
		</Container>
	);
}

function DivHeader(name: string, link: string) {
	return (
		<Link href={link}>
			<Button className="btn btn-primary container p-5 h-100 rounded-5">
				<h1>{name}</h1>
			</Button>
		</Link>
	);
}

export default function Home() {
	return (
		<>
			<main>
				<NavbarComponent />
				<Container
					fluid
					className="mt-5 text-center px-5"
					style={{ height: "80vh" }}
				>
					<Row className="h-100">
						<Col xs={12} lg={3} className="small-box mb-3 mb-lg-0">
							{DivHeader("Chat", "chat")}
						</Col>
						<Col xs={12} lg={9} className="large-box">
							<Row className="h-100">
								<Col xs={12} lg={6} className="mb-3">
									{DivHeader("Calendario", "calendar")}
								</Col>
								<Col xs={12} lg={6} className="mb-3">
									{DivHeader("Progetti", "projects")}
								</Col>
								<Col xs={12} lg={6} className="mb-3 mb-lg-0">
									{DivHeader("Note", "notepad")}
								</Col>
								<Col xs={12} lg={6} className="mb-3 mb-lg-0">
									{DivHeader("Pomodoro", "pomodoro")}
								</Col>
							</Row>
						</Col>
					</Row>
				</Container>
			</main>
		</>
	);
}
