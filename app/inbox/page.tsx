"use client";

import { GlobalSideBar } from "@/app/components/GlobalSideBar";
import { Invitation, InvitationList } from "@/app/inbox/InvitationList";
import { generalFetcher, safeFetch } from "@/utils/fetch/fetch";
import { Container } from "react-bootstrap";
import { toast } from "react-toastify";
import useSWR from "swr";

export default function Inbox() {
	const { data, error, mutate } = useSWR<Invitation[]>(
		"/api/user/getInbox",
		generalFetcher
	);

	async function handleAccept(id: string) {
		const response = await safeFetch(
			fetch("/api/user/acceptInvite", {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({ _id: id })
			})
		);
		if (!response.ok) {
			toast.error("Errore durante l'accettazione dell'invito!");
		} else {
			toast.success("Invito accettato con successo!");
			mutate();
		}
	}

	async function handleDecline(id: string) {
		const response = await safeFetch(
			fetch("/api/user/declineInvite", {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({ _id: id })
			})
		);
		if (!response.ok) {
			toast.error("Errore durante il rifiuto dell'invito!");
		} else {
			toast.success("Invito rifiutato con successo!");
			mutate();
		}
	}

	return (
		<div className="dvh-100 overflow-y-auto bg-light">
			<GlobalSideBar />
			<Container className="my-4">
				<h1 className="mb-4 mt-5 mt-lg-0 pt-4 pt-lg-0">Inbox</h1>
				<InvitationList
					invitations={data}
					error={error}
					onAccept={handleAccept}
					onDecline={handleDecline}
				/>
			</Container>
		</div>
	);
}
