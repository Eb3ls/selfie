"use client";

import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { GrResources } from "react-icons/gr";
import { IoMdGlobe } from "react-icons/io";
import useSWR from "swr";
import { StandardModal } from "../components/StandardModal";

type Resource = {
	id: string;
	name: string;
};

async function fetcher(url: string) {
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error("Errore durante il fetch delle risorse");
	}
	return response.json();
}

export function ResourcesModal() {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [searchValue, setSearchValue] = useState("");

	const [resources, setResources] = useState<Resource[]>([]);

	const router = useRouter();

	// Fetch della lista delle risorse
	const { data: raw_resources, error: error_resources } = useSWR(
		"/api/calendar/getResources",
		fetcher,
		{
			revalidateOnFocus: false
		}
	);

	useEffect(() => {
		if (raw_resources) {
			const newResources = raw_resources.map((resource: Resource) => {
				return {
					...resource,
					name: resource.name.substring(6)
				};
			});
			setResources(newResources);
		}
	}, [raw_resources]);

	const filteredResources = resources.filter((resource) =>
		resource.name.toLowerCase().includes(searchValue.toLowerCase())
	);

	function createResourceEntry(resource: Resource) {
		return (
			<div
				key={resource.id}
				className="d-flex align-items-center p-3 mt-2 rounded-3 border hover-lift"
				style={{
					backgroundColor: "#ffffff",
					transition: "all 0.2s ease-in-out"
				}}
			>
				<div className="d-flex align-items-center flex-grow-1">
					<GrResources className="fs-4 text-primary me-3" />
					<span className="fw-medium">{resource.name}</span>
				</div>
				<button
					className="btn btn-light rounded-pill px-4 hover-lift"
					onClick={(e: any) => {
						e.preventDefault();
						router.push("/calendar/" + resource.id);
					}}
				>
					<i className="bi bi-calendar3 me-2"></i>
					Visualizza
				</button>
			</div>
		);
	}

	function searchResourcesBlock() {
		return (
			<div className="position-relative mb-2">
				<div className="position-relative">
					<input
						type="text"
						className="form-control form-control-lg py-3 ps-5 pe-4 rounded-pill shadow-sm"
						placeholder="Cerca risorse..."
						value={searchValue}
						onChange={(e) => setSearchValue(e.target.value)}
						autoFocus
					/>
					<i className="bi bi-search position-absolute top-50 translate-middle-y ms-4 text-muted"></i>
					{searchValue && (
						<button
							className="btn position-absolute top-50 end-0 translate-middle-y me-3 p-0"
							onClick={() => setSearchValue("")}
						>
							<i className="bi bi-x-circle text-muted fs-5"></i>
						</button>
					)}
				</div>
			</div>
		);
	}

	return (
		<div>
			<button
				className="btn resource-color rounded-pill hover-lift text-white shadow-sm fw-semibold"
				onClick={() => setIsModalOpen(true)}
			>
				<i className="bi bi-search me-2" />
				Risorse
			</button>

			<StandardModal
				title="Risorse Disponibili"
				titleIcon={<IoMdGlobe className="fs-3" />}
				show={isModalOpen}
				handleClose={() => setIsModalOpen(false)}
			>
				<div className="m-2">
					{searchResourcesBlock()}
					<div
						className="resource-list"
						style={{ maxHeight: "70vh", overflowY: "auto" }}
					>
						{!error_resources ? (
							filteredResources.length > 0 ? (
								filteredResources.map((resource) =>
									createResourceEntry(resource)
								)
							) : (
								<div className="text-center text-muted p-4">
									<i className="bi bi-emoji-frown fs-4"></i>
									<p>Nessuna risorsa trovata</p>
								</div>
							)
						) : (
							<div className="text-center text-muted p-4">
								<i className="bi bi-exclamation-triangle fs-4"></i>
								<p>Errore nel caricamento delle risorse</p>
							</div>
						)}
					</div>
				</div>
			</StandardModal>
		</div>
	);
}
