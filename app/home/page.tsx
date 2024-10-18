"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button, Col, Container, Row } from "react-bootstrap";
import useSWR from "swr";

type ReducedUser = {
	_id: string;
	username: string;
	firstName: string;
	lastName: string;
	email: string;
	birthDay: string;
	userStatus: string;
	profilePic: string;
};

async function doLogout() {
	const response = await fetch("/api/user/logout", {
		method: "GET"
	});

	if (response.status === 200) {
		alert("Successful!");
		window.location.href = "/";
	} else {
		alert("Failed! Status code: " + response.status);
	}
}

function NavbarComponent({ user }: { user: ReducedUser | null }) {
	return (
		<Container
			fluid
			className="mt-5 d-flex justify-content-between text-center"
		>
			<div className="d-flex flex-row ms-3">
				<i className="bi bi-person fs-1 me-2"></i>
				<div className="d-flex flex-column">
					<div className="fs-4">
						{!user && <div>Loading...</div>}
						{user && <div>{user.username}</div>}
					</div>
					<div>
						{!user && <div>Loading...</div>}
						{user && <div>{user.email}</div>}
					</div>
				</div>
			</div>
			<div className="mx-5 d-flex flex-row align-items-center">
				<i className="bi bi-bell fs-1 me-3"></i>
				<i className="bi bi-telegram fs-1 me-3"></i>
				<h2 className="me-3">Selfie</h2>
				<div style={{ cursor: "pointer" }} onClick={doLogout}>
					<i className="bi bi-box-arrow-right fs-1 me-3"></i>
				</div>
			</div>
		</Container>
	);
}

function DivHeader({ name, link }: { name: string; link: string }) {
	return (
		<Link href={link}>
			<Button className="btn btn-primary container p-5 h-100 rounded-5">
				<h1>{name}</h1>
			</Button>
		</Link>
	);
}

async function fetcher(url: string) {
	const response = await fetch(url);
	if (!response.ok) {
		alert("Errore durante il fetch dello user");
	}
	return response.json();
}

export default function Home() {
	const [user, setUser] = useState<ReducedUser | null>(null);

	// Fetch dei dati dei contatti a sinistra
	const { data: raw_user, error: error_user } = useSWR(
		"/api/user/getUser",
		fetcher,
		{
			revalidateOnFocus: false // Disabilita il refetch quando si torna alla finestra
		}
	);

	// Aggiorna user quando i dati vengono recuperati
	useEffect(() => {
		if (raw_user) {
			setUser(raw_user);
		}
	}, [raw_user]);

	return (
		<>
			<main>
				<NavbarComponent user={user} />
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
