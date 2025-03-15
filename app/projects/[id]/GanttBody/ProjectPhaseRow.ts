import {
	CELL_WIDTH_PX,
	PhaseResponse,
	ROW_HEIGHT_PX,
	calculateCells
} from "../Utils";

class ProjectPhaseRow extends HTMLElement {
	rowsArray: HTMLElement[] = [];

	constructor() {
		super();
	}

	loadProjectData(data: PhaseResponse[], currentDate: Date) {
		if (!data) return;
		this.render(data, currentDate);
	}

	createSingleCell() {
		const cell = document.createElement("div");
		cell.className =
			"d-flex flex-column align-items-center justify-content-center flex-shrink-0";
		cell.style.borderBottom = "1px solid grey";
		cell.style.borderRight = "1px solid grey";
		cell.style.width = `${CELL_WIDTH_PX}`;
		cell.innerHTML = "Cell";
		return cell;
	}

	renderPhaseRow(data: PhaseResponse, cells: number) {
		// Row per la fase
		const row = document.createElement("div");
		row.style.height = `${ROW_HEIGHT_PX}`;
		row.className = "d-flex bg-white z-1 phase-row";
		this.rowsArray.push(row);

		for (let i = 1; i <= cells; i++) {
			const cell = this.createSingleCell();
			row.appendChild(cell);
		}

		// Contenitore per il collapse con lo stesso id per fare il toggle di tutti
		const collapse = document.createElement("div");
		collapse.id = `collapse${data._id}`;
		collapse.className = "collapse d-flex";

		// Gestione delle sottofasi
		if (data.subPhases && data.subPhases.length > 0) {
			for (const subPhase of data.subPhases) {
				// collapse.innerHTML += this.renderPhaseRow(subPhase);
			}
		}

		//Gestione delle attività
		if (data.activities && data.activities.length > 0) {
			for (const activity of data.activities) {
				// const activityElement = this.handleRow(activity.summary);
				// collapse.appendChild(activityElement);
			}
		}

		const container = document.createElement("div");
		container.appendChild(row);
		container.appendChild(collapse);

		return container;
	}

	public shiftTimeline(isRightScroll: boolean): void {
		this.rowsArray.forEach((row) => {
			// Remove cells
			for (let i = 0; i < 3; i++) {
				if (isRightScroll) {
					const firstCell = row.firstElementChild;
					if (firstCell) {
						row.removeChild(firstCell);
					}
				} else {
					const lastCell = row.lastElementChild;
					if (lastCell) {
						row.removeChild(lastCell);
					}
				}
			}
			// Add new cells
			for (let i = 0; i < 3; i++) {
				const newCell = this.createSingleCell();
				newCell.innerHTML = "New Cell";
				if (isRightScroll) {
					console.log("Right");
					row.appendChild(newCell);
				} else {
					row.insertBefore(newCell, row.firstChild);
				}
			}
		});
	}

	public render(data: PhaseResponse[], currentDate: Date) {
		const cellsNumber = calculateCells(this);

		for (const phase of data) {
			const phaseRow = this.renderPhaseRow(phase, cellsNumber);
			this.appendChild(phaseRow);
		}
	}
}

customElements.define("project-phase-row", ProjectPhaseRow);

export default ProjectPhaseRow;
