"use client";

import { Button, Form, InputGroup } from "react-bootstrap";
import { FaFilter, FaPlus, FaSort } from "react-icons/fa";
import { AddNoteModal } from "./AddNoteModal";
import { FilterModal } from "./FilterModal";
import styles from "./Notepad.module.css";
import { SortModal } from "./SortModal";

export function SearchBar({
	handleFilters,
	handleSort,
	handleSearch,
	handleAdd
}: any) {
	return (
		<div className={styles.searchContainer}>
			<div className={styles.searchGroup}>
				<Form.Control
					className={styles.searchInput}
					type="text"
					placeholder="Cerca note..."
					aria-label="Search"
					name="searchBar"
					onChange={handleSearch}
				/>

				<div className={styles.actionsGroup}>
					<FilterModal handleFilters={handleFilters}>
						<Button variant="outline" className={styles.actionBtn}>
							<FaFilter className={styles.btnIcon} />
							<span className={styles.btnText}>Filtri</span>
						</Button>
					</FilterModal>

					<SortModal handleSort={handleSort}>
						<Button variant="outline" className={styles.actionBtn}>
							<FaSort className={styles.btnIcon} />
							<span className={styles.btnText}>Ordinamento</span>
						</Button>
					</SortModal>

					<AddNoteModal handleAdd={handleAdd}>
						<Button variant="primary" className={styles.addBtn}>
							<FaPlus className={styles.btnIcon} />
							<span className={styles.btnText}>Nuova nota</span>
						</Button>
					</AddNoteModal>
				</div>
			</div>
		</div>
	);
}
