"use client";

import { GlobalSideBar } from "@/app/components/GlobalSideBar";
import { StringInvitation } from "@/utils/db/db";
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

export default function Inbox() {
	const { data, error } = useSWR<StringInvitation[]>(
		"/api/user/getInbox",
		fetcher
	);

	async function handleAccept(id: string, type: string) {
		const response = await fetch("/api/user/acceptInvite", {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({ _id: id, type: type })
		});
		if (!response.ok) {
			alert("Errore durante il fetch dell'API acceptInvite!");
		} else {
			window.location.reload();
		}
	}

	return (
		<>
			<GlobalSideBar />
			<Container className="mt-4">
				<h1 className="mb-4">Inbox</h1>
				{error && (
					<div className="text-danger mb-3">
						Errore nel caricamento degli inviti.
					</div>
				)}
				{data && data.length > 0
					? data.map((invitation: StringInvitation) => (
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
										{invitation.userId}
									</Card.Text>
									<Card.Text>
										<strong>Tipologia:</strong>{" "}
										{invitation.type}
									</Card.Text>
									<Card.Text>
										<strong>Target ID:</strong>{" "}
										{invitation.targetId}
									</Card.Text>
								</Card.Body>
								<Card.Footer>
									<Button
										variant="success"
										onClick={() =>
											handleAccept(
												invitation._id!,
												invitation.type
											)
										}
									>
										Accetta
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
		</>
	);
}
