"use client";

import { Form } from "react-bootstrap";
import { FaPlus, FaSort } from "react-icons/fa";
import { AddProjectModal } from "./AddProjectModal";
import { SortModal } from "./SortModal";
import "./style.css";

interface SearchBarProps {
	handleAdd: (project: any) => void;
	setSortParams: (sort: any) => void;
	setSearchTerm: (search: string) => void;
}

export function SearchBar({
	handleAdd,
	setSortParams,
	setSearchTerm
}: SearchBarProps) {
	return (
		<div
			className="d-flex flex-column gap-4 mx-auto"
			style={{ maxWidth: "800px" }}
		>
			<div className="w-100">
				<Form.Control
					type="text"
					placeholder="Cerca progetti..."
					aria-label="Search projects"
					name="searchBar"
					onChange={(e) => {
						setSearchTerm(e.target.value);
					}}
					className="search-input p-3 rounded-3"
				/>
			</div>

			<div className="d-flex justify-content-center align-items-center gap-3">
				<SortModal setSortParams={setSortParams}>
					<button className="action-button p-2 rounded-3 bg-white d-flex align-items-center fw-semibold hover-lift">
						<FaSort />
						<span className="ms-2">Ordina</span>
					</button>
				</SortModal>

				<AddProjectModal handleAdd={handleAdd}>
					<button className="action-button primary p-2 rounded-3 border-0 text-white d-flex align-items-center fw-semibold hover-lift">
						<FaPlus />
						<span className="ms-2">Crea</span>
					</button>
				</AddProjectModal>
			</div>
		</div>
	);
}
