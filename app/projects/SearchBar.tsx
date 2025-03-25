"use client";

import { Button, Form } from "react-bootstrap";
import { FaFilter, FaPlus, FaSort } from "react-icons/fa";
import { AddProjectModal } from "./AddProjectModal";
import styles from "./Projects.module.css";
import { SortModal } from "./SortModal";

export function SearchBar({ handleSort, handleSearch, handleAdd }: any) {
	return (
		<div className={styles.searchContainer}>
			<div className={styles.searchGroup}>
				<Form.Control
					className={styles.searchInput}
					type="text"
					placeholder="Cerca progetti"
					aria-label="Search projects"
					name="searchBar"
					onChange={handleSearch}
				/>

				<div className={styles.actionsGroup}>
					<SortModal handleSort={handleSort}>
						<Button variant="outline" className={styles.actionBtn}>
							<FaSort className={styles.btnIcon} />
							<span className={styles.btnText}>Ordina</span>
						</Button>
					</SortModal>

					<AddProjectModal handleAdd={handleAdd}>
						<Button variant="primary" className={styles.addBtn}>
							<FaPlus className={styles.btnIcon} />
							<span className={styles.btnText}>
								Nuovo progetto
							</span>
						</Button>
					</AddProjectModal>
				</div>
			</div>
		</div>
	);
}
