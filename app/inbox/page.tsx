"use client";

import { GlobalSideBar } from "@/app/components/GlobalSideBar";
import React from "react";
import { Button, Card, Container } from "react-bootstrap";
import useSWR from "swr";

async function fetcher(url: string) {
	const response = await fetch(url);
	if (!response.ok) {
		alert("Errore durante il fetch dell'API getInbox!");
	}
	return response.json();
}

type ApiResponse = {
	_id: string;
	username: string;
	type: "ACTIVITY" | "EVENT" | "SESSION" | "PROJECT" | "NOTE";
	targetSummary: string;
};

export default function Inbox() {
	const { data, error } = useSWR<ApiResponse[]>(
		"/api/user/getInbox",
		fetcher
	);

	async function handleAccept(id: string) {
		const response = await fetch("/api/user/acceptInvite", {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({ _id: id })
		});
		if (!response.ok) {
			alert("Errore durante il fetch dell'API acceptInvite!");
		} else {
			window.location.reload();
		}
	}

	async function handleDecline(id: string) {
		const response = await fetch("/api/user/declineInvite", {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({ _id: id })
		});
		if (!response.ok) {
			alert("Errore durante il fetch dell'API declineInvite!");
		} else {
			window.location.reload();
		}
	}

	return (
		<div>
			<GlobalSideBar />
			<Container className="mt-4">
				<h1 className="mb-4">Inbox</h1>
				{error && (
					<div className="text-danger mb-3">
						Errore nel caricamento degli inviti.
					</div>
				)}
				{data && data.length > 0
					? data.map((invitation: ApiResponse) => (
							<Card
								key={invitation._id}
								className="mb-3 shadow-sm"
							>
								<Card.Header>
									Invito ID: {invitation._id}
								</Card.Header>
								<Card.Body>
									<Card.Text>
										<strong>Utente:</strong>{" "}
										{invitation.username}
									</Card.Text>
									<Card.Text>
										<strong>Tipologia:</strong>{" "}
										{invitation.type}
									</Card.Text>
									<Card.Text>
										<strong>Titolo:</strong>{" "}
										{invitation.targetSummary}
									</Card.Text>
								</Card.Body>
								<Card.Footer>
									<Button
										variant="success"
										className="me-2"
										onClick={() =>
											handleAccept(invitation._id!)
										}
									>
										Accetta
									</Button>
									<Button
										variant="danger"
										onClick={() =>
											handleDecline(invitation._id!)
										}
									>
										Rifiuta
									</Button>
								</Card.Footer>
							</Card>
						))
					: !error && (
							<div className="text-muted">
								Nessun invito trovato.
							</div>
						)}
			</Container>
		</div>
	);
}
