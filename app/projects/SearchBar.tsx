"use client";

import { Button, Form } from "react-bootstrap";
import { FaFilter, FaPlus, FaSort } from "react-icons/fa";
import { AddProjectModal } from "./AddProjectModal";
import styles from "./Projects.module.css";
// Make sure this CSS module exists
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
					placeholder="Search projects..."
					aria-label="Search projects"
					name="searchBar"
					onChange={handleSearch}
				/>

				<div className={styles.actionsGroup}>
					<SortModal handleSort={handleSort}>
						<Button variant="outline" className={styles.actionBtn}>
							<FaSort className={styles.btnIcon} />
							<span className={styles.btnText}>Sort</span>
						</Button>
					</SortModal>

					<AddProjectModal handleAdd={handleAdd}>
						<Button variant="primary" className={styles.addBtn}>
							<FaPlus className={styles.btnIcon} />
							<span className={styles.btnText}>New Project</span>
						</Button>
					</AddProjectModal>
				</div>
			</div>
		</div>
	);
}
