"use client";

import { Sidebar } from "@/app/components/Sidebar";
import { StringNote } from "@/utils/db/db";
import React, { useEffect, useState } from "react";
import {
	Button,
	Card,
	Col,
	Container,
	Form,
	InputGroup,
	Row
} from "react-bootstrap";
import { FaFilter, FaPlus, FaSort, FaTrash } from "react-icons/fa";
import useSWR from "swr";

function onAdd() {}
function onSort() {}
function onFilter() {}
function handleDelete(id: string) {}

function SearchBar() {
	return (
		<InputGroup className="mb-3">
			<Form.Control
				type="text"
				placeholder="Search..."
				aria-label="Search"
				name="searchBar"
			/>
			<Button variant="secondary">
				<FaFilter /> {/* Icona del filtro */}
			</Button>
			<Button variant="secondary">
				<FaSort /> {/* Icona del sort */}
			</Button>
			<Button variant="primary">
				<FaPlus /> {/* Icona del '+' */}
			</Button>
		</InputGroup>
	);
}

async function fetcher(url: string) {
	const response = await fetch(url);
	if (!response.ok) {
		alert("Errore durante il fetch delle note!");
	}
	return response.json();
}

export default function Notepad() {
	const [notes, setNotes] = useState<StringNote[]>([]);

	const { data, error } = useSWR("/api/notepad/getNotes", fetcher);

	// Aggiorna notes quando i dati vengono recuperati
	useEffect(() => {
		if (data) {
			setNotes(data);
		}
	}, [data]);

	return (
		<>
			<Sidebar />
			<Container fluid="sm" className="mt-5 text-center px-5">
				<h1 className="mb-5">Notepad</h1>
				<SearchBar />
				<Row className="mt-5 gx-5 text-center">
					{error && <div>Failed to load</div>}
					{!data && <div>Loading...</div>}
					{data &&
						notes.map((note: StringNote) => (
							<Col
								key={note._id}
								className="col-12 col-md-6 col-lg-4 mb-3"
							>
								<Card>
									<Card.Body>
										<div className="d-flex justify-content-between align-items-center">
											<Card.Title>
												{note.summary}
											</Card.Title>
											<Button
												variant="danger"
												onClick={() => {
													handleDelete(note._id!);
												}}
											>
												<FaTrash />
											</Button>
										</div>
										<div className="d-flex justify-content-between align-items-center">
											<Card.Subtitle className="mb-2 text-muted">
												{note.categories}
											</Card.Subtitle>
										</div>
										<hr />
										<Card.Text>
											{note.text.length < 200
												? note.text
												: note.text.substring(0, 200) +
													"..."}
										</Card.Text>
									</Card.Body>
								</Card>
							</Col>
						))}
				</Row>
			</Container>
		</>
	);
}

// TODO: Implementare la logica, aggiungere categoria al model di note.
