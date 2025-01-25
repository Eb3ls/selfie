"use client";

import { Button, Form, InputGroup } from "react-bootstrap";
import { FaPlus, FaSort } from "react-icons/fa";
import { AddProjectModal } from "./AddProjectModal";
import { SortModal } from "./SortModal";

export function SearchBar({ handleSort, handleSearch, handleAdd }: any) {
	return (
		<InputGroup className="mb-3">
			<Form.Control
				type="text"
				placeholder="Search projects..."
				aria-label="Search projects"
				name="searchBar"
				onChange={handleSearch}
			/>

			<SortModal handleSort={handleSort}>
				<Button variant="secondary">
					<FaSort /> {/* Icon for sorting */}
				</Button>
			</SortModal>

			<AddProjectModal handleAdd={handleAdd}>
				<Button variant="primary">
					<FaPlus /> {/* Icon for adding new projects */}
				</Button>
			</AddProjectModal>
		</InputGroup>
	);
}
