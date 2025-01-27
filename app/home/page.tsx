"use client";

import Link from "next/link";
import { Button, Col, Container, Row } from "react-bootstrap";
import { GlobalSideBar } from "../components/GlobalSideBar";

function DivHeader({ name, link }: { name: string; link: string }) {
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
				<GlobalSideBar />
				<Container
					fluid
					className="mt-5 text-center px-5"
					style={{ height: "80vh" }}
				>
					<Row className="h-100">
						<Col xs={12} lg={3} className="small-box mb-3 mb-lg-0">
							<DivHeader name="Chat" link="chat" />
						</Col>
						<Col xs={12} lg={9} className="large-box">
							<Row className="h-100">
								<Col xs={12} lg={6} className="mb-3">
									<DivHeader
										name="Calendario"
										link="calendar"
									/>
								</Col>
								<Col xs={12} lg={6} className="mb-3">
									<DivHeader
										name="Progetti"
										link="projects"
									/>
								</Col>
								<Col xs={12} lg={6} className="mb-3 mb-lg-0">
									<DivHeader name="Note" link="notepad" />
								</Col>
								<Col xs={12} lg={6} className="mb-3 mb-lg-0">
									<DivHeader
										name="Pomodoro"
										link="pomodoro"
									/>
								</Col>
							</Row>
						</Col>
					</Row>
				</Container>
			</main>
		</>
	);
}
