"use client";

import React from "react";
import { Button, Form, InputGroup } from "react-bootstrap";
import { FaFilter, FaPlus, FaSort } from "react-icons/fa";
import { FilterModal } from "./FilterModal";
import { SortModal } from "./SortModal";

export function SearchBar({ handleFilters, handleSort }: any) {
	return (
		<InputGroup className="mb-3">
			<Form.Control
				type="text"
				placeholder="Search..."
				aria-label="Search"
				name="searchBar"
			/>

			<FilterModal handleFilters={handleFilters}>
				<Button variant="secondary">
					<FaFilter /> {/* Icona del filtro */}
				</Button>
			</FilterModal>

			<SortModal handleSort={handleSort}>
				<Button variant="secondary">
					<FaSort /> {/* Icona del sort */}
				</Button>
			</SortModal>
			<Button variant="primary">
				<FaPlus /> {/* Icona del '+' */}
			</Button>
		</InputGroup>
	);
}
