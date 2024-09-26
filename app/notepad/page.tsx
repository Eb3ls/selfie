"use client";

import { Sidebar } from "@/app/components/Sidebar";
import React, { useState } from "react";
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

const data = [
	{
		_id: "66c76fbf764cb9b9d0a13f68",
		ownerId: "66c76fbf764cb9b9d0a13f68",
		summary: "Meeting Notes",
		text: "## Discussed Items\nIn our last meeting, we discussed several important topics that will significantly influence our project timeline. The team reviewed the latest updates on budget approval, emphasizing the need to stay within our projected costs while ensuring that we meet our quality standards. Everyone's input was valuable, and we created action items for follow-up discussions. It's crucial that we maintain clear communication to avoid any misunderstandings as we move for...",
		length: 300,
		access: "PUBLIC",
		dtStamp: "2024-09-01T10:00:00Z",
		dtModified: "2024-09-02T10:00:00Z",
		userIdList: ["66c76fbf764cb9b9d0a13f68", "66c76fbf764cb9b9d0a13f68"],
		activityIdList: ["66c76fbf764cb9b9d0a13f68"]
	},
	{
		_id: "66c76fbf764cb9b9d0a13f68",
		ownerId: "66c76fbf764cb9b9d0a13f68",
		summary: "Personal Journal",
		text: "Today I had a breakthrough in my understanding of TypeScript. I delved into its powerful type system and how it can enhance the reliability of my code. It's fascinating to see how TypeScript allows us to define interfaces, which can help us enforce structure and consistency throughout our projects. As I explored further, I also considered how generics work in TypeScript, which allows for the creation of reusable components. Overall, I'm excited to integrate these concepts into my workflo...",
		length: 358,
		access: "PRIVATE",
		dtStamp: "2024-09-03T10:00:00Z",
		dtModified: "2024-09-03T10:00:00Z",
		userIdList: ["66c76fbf764cb9b9d0a13f68"],
		activityIdList: null
	},
	{
		_id: "66c76fbf764cb9b9d0a13f68",
		ownerId: "66c76fbf764cb9b9d0a13f68",
		summary: "Team Outing",
		text: "We had a fantastic time during our recent team outing at the local park! The weather was perfect, and everyone was in great spirits. We kicked off the day with some team-building exercises that encouraged collaboration and communication. After that, we enjoyed a lovely picnic with an array of delicious foods that everyone contributed. There were games, laughter, and a lot of bonding moments that helped strengthen our team's camaraderie. Such outings remind us of the importance of taking ...",
		length: 393,
		access: "INVITED",
		dtStamp: "2024-09-04T10:00:00Z",
		dtModified: "2024-09-05T10:00:00Z",
		userIdList: [
			"66c76fbf764cb9b9d0a13f68",
			"66c76fbf764cb9b9d0a13f68",
			"66c76fbf764cb9b9d0a13f68"
		],
		activityIdList: null
	},
	{
		_id: "66c76fbf764cb9b9d0a13f68",
		ownerId: "66c76fbf764cb9b9d0a13f68",
		summary: "Research Notes",
		text: "### Key Findings\nAfter conducting thorough research on our target market, we identified several key findings that will guide our strategy moving forward. Firstly, the demand for our product has seen a steady increase, indicating that we are on the right track with our current offerings. However, we must also consider the competition, which is intensifying. We found that our customers value not only quality but also sustainability in the products they choose. Therefore, it's crucial ...",
		length: 408,
		access: "INVITED",
		dtStamp: "2024-09-06T10:00:00Z",
		dtModified: "2024-09-07T10:00:00Z",
		userIdList: ["66c76fbf764cb9b9d0a13f68", "66c76fbf764cb9b9d0a13f68"],
		activityIdList: ["66c76fbf764cb9b9d0a13f68"]
	},
	{
		_id: "66c76fbf764cb9b9d0a13f68",
		ownerId: "66c76fbf764cb9b9d0a13f68",
		summary: "Research Notes",
		text: "### Key Findings\nAfter conducting thorough research on our target market, we identified several key findings that will guide our strategy moving forward. Firstly, the demand for our product has seen a steady increase, indicating that we are on the right track with our current offerings. However, we must also consider the competition, which is intensifying. We found that our customers value not only quality but also sustainability in the products they choose. Therefore, it's crucial ...",
		length: 408,
		access: "INVITED",
		dtStamp: "2024-09-06T10:00:00Z",
		dtModified: "2024-09-07T10:00:00Z",
		userIdList: ["66c76fbf764cb9b9d0a13f68", "66c76fbf764cb9b9d0a13f68"],
		activityIdList: ["66c76fbf764cb9b9d0a13f68"]
	},
	{
		_id: "66c76fbf764cb9b9d0a13f68",
		ownerId: "66c76fbf764cb9b9d0a13f68",
		summary: "Research Notes",
		text: "### Key Findings\nAfter conducting thorough research on our target market, we identified several key findings that will guide our strategy moving forward. Firstly, the demand for our product has seen a steady increase, indicating that we are on the right track with our current offerings. However, we must also consider the competition, which is intensifying. We found that our customers value not only quality but also sustainability in the products they choose. Therefore, it's crucial ...",
		length: 408,
		access: "INVITED",
		dtStamp: "2024-09-06T10:00:00Z",
		dtModified: "2024-09-07T10:00:00Z",
		userIdList: ["66c76fbf764cb9b9d0a13f68", "66c76fbf764cb9b9d0a13f68"],
		activityIdList: ["66c76fbf764cb9b9d0a13f68"]
	},
	{
		_id: "66c76fbf764cb9b9d0a13f68",
		ownerId: "66c76fbf764cb9b9d0a13f68",
		summary: "Research Notes",
		text: "### Key Findings\nAfter conducting thorough research on our target market, we identified several key findings that will guide our strategy moving forward. Firstly, the demand for our product has seen a steady increase, indicating that we are on the right track with our current offerings. However, we must also consider the competition, which is intensifying. We found that our customers value not only quality but also sustainability in the products they choose. Therefore, it's crucial ...",
		length: 408,
		access: "INVITED",
		dtStamp: "2024-09-06T10:00:00Z",
		dtModified: "2024-09-07T10:00:00Z",
		userIdList: ["66c76fbf764cb9b9d0a13f68", "66c76fbf764cb9b9d0a13f68"],
		activityIdList: ["66c76fbf764cb9b9d0a13f68"]
	},
	{
		_id: "66c76fbf764cb9b9d0a13f68",
		ownerId: "66c76fbf764cb9b9d0a13f68",
		summary: "Research Notes",
		text: "### Key Findings\nAfter conducting thorough research on our target market, we identified several key findings that will guide our strategy moving forward. Firstly, the demand for our product has seen a steady increase, indicating that we are on the right track with our current offerings. However, we must also consider the competition, which is intensifying. We found that our customers value not only quality but also sustainability in the products they choose. Therefore, it's crucial ...",
		length: 408,
		access: "INVITED",
		dtStamp: "2024-09-06T10:00:00Z",
		dtModified: "2024-09-07T10:00:00Z",
		userIdList: ["66c76fbf764cb9b9d0a13f68", "66c76fbf764cb9b9d0a13f68"],
		activityIdList: ["66c76fbf764cb9b9d0a13f68"]
	}
];

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

export default function Notepad() {
	const [notes, setNotes] = useState(data);

	return (
		<>
			<Sidebar />
			<Container fluid="sm" className="mt-5 text-center px-5">
				<h1 className="mb-5">Notepad</h1>
				<SearchBar />
				<Row className="mt-5 gx-5 text-center">
					{data.map((note: any) => (
						<Col
							key={note.id}
							className="col-12 col-md-6 col-lg-4 mb-3"
						>
							<Card>
								<Card.Body>
									<div className="d-flex justify-content-between align-items-center">
										<Card.Title>{note.summary}</Card.Title>
										<Button
											variant="danger"
											onClick={() => {
												handleDelete(note.id);
											}}
										>
											<FaTrash />
										</Button>
									</div>
									<div className="d-flex justify-content-between align-items-center">
										<Card.Subtitle className="mb-2 text-muted">
											{note.category}
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
