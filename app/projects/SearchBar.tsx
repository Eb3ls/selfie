"use client";

import { Button, Form } from "react-bootstrap";
import { FaPlus, FaSort } from "react-icons/fa";
import { AddProjectModal } from "./AddProjectModal";
import { SortModal } from "./SortModal";

export function SearchBar({ handleSort, handleSearch, handleAdd }: any) {
	return (
		<div className="container-md d-flex justify-content-center align-items-center flex-column p-3 my-3 bg-light rounded-3 shadow-sm">
			<div className="w-75">
				<Form.Control
					type="text"
					placeholder="Cerca progetti"
					aria-label="Search projects"
					name="searchBar"
					onChange={handleSearch}
				/>
			</div>

			<div className="d-flex gap-2 justify-content-center align-items-center mt-3">
				<SortModal handleSort={handleSort}>
					<Button variant="outline">
						<FaSort />
						<span>Ordina</span>
					</Button>
				</SortModal>

				<AddProjectModal handleAdd={handleAdd}>
					<Button variant="primary">
						<FaPlus />
						<span>Nuovo progetto</span>
					</Button>
				</AddProjectModal>
			</div>
		</div>
	);
}
