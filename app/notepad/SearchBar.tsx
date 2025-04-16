"use client";

import { Button, Form } from "react-bootstrap";
import { FaFilter, FaPlus, FaSort } from "react-icons/fa";
import { AddNoteModal } from "./AddNoteModal";
import { FilterModal } from "./FilterModal";
import { SortModal } from "./SortModal";
import "./style.css";

export function SearchBar({
	handleFilters,
	handleSort,
	handleSearch,
	handleAdd
}: any) {
	return (
		<div>
			<div
				className="d-flex flex-column gap-4 mx-auto"
				style={{ maxWidth: "800px" }}
			>
				<div className="w-100">
					<Form.Control
						type="text"
						placeholder="Cerca note..."
						aria-label="Search notes"
						name="searchBar"
						onChange={handleSearch}
						className="note-search-input p-3 rounded-3"
					/>
				</div>

				<div className="d-flex justify-content-center align-items-center gap-3">
					<FilterModal handleFilters={handleFilters}>
						<button className="action-button p-2 px-3 rounded-3 bg-white d-flex align-items-center fw-semibold hover-lift">
							<FaFilter />
							<span> Filtri</span>
						</button>
					</FilterModal>

					<SortModal handleSort={handleSort}>
						<button className="action-button p-2 rounded-3 bg-white d-flex align-items-center fw-semibold hover-lift">
							<FaSort />
							<span className="ms-2">Ordina</span>
						</button>
					</SortModal>

					<AddNoteModal handleAdd={handleAdd}>
						<button className="action-button btn btn-primary p-2 rounded-3 border-0 text-white d-flex align-items-center fw-semibold hover-lift">
							<FaPlus />
							<span className="ms-2">Crea</span>
						</button>
					</AddNoteModal>
				</div>
			</div>
		</div>
	);
}
