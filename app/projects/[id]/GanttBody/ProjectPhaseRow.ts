import {
	CELL_WIDTH_PX,
	PhaseResponse,
	ProjectActivityResponse,
	ROW_HEIGHT_PX,
	SubPhaseResponse,
	calculateCells,
	statusConfig
} from "../Utils";

interface RowReference {
	row: HTMLElement;
	startDate: Date;
	dueDate: Date;
	statusColor: string;
	isMilstone: boolean;
}

class ProjectPhaseRow extends HTMLElement {
	firstDate: Date;
	cellsNumber: number;
	phasesData: PhaseResponse[];
	rowsArray: RowReference[];

	constructor() {
		super();
		this.firstDate = new Date();
		this.cellsNumber = 0;
		this.phasesData = [];
		this.rowsArray = [];
	}

	loadProjectData(data: PhaseResponse[], currentDate: Date) {
		if (!data) return;
		this.phasesData = data;
		this.render(currentDate);
	}

	pushReference(
		ref: HTMLElement,
		data: ProjectActivityResponse | SubPhaseResponse | PhaseResponse,
		type: "activity" | "subPhase" | "phase"
	) {
		let status = "";
		if (type === "activity") {
			const statusKey = (data as ProjectActivityResponse)
				.status as keyof typeof statusConfig;
			status = statusConfig[statusKey].color;
		} else if (type === "subPhase") {
			status = "grey";
		} else {
			status = "black";
		}

		this.rowsArray.push({
			row: ref,
			startDate: new Date(data.dtStart),
			dueDate: new Date(data.due),
			statusColor: status,
			isMilstone: "isMilestone" in data ? data.isMilestone : false
		});
	}

	createSingleCell(date: Date) {
		const cell = document.createElement("div");
		cell.className =
			"d-flex flex-column align-items-center justify-content-center flex-shrink-0";
		cell.style.borderBottom = "1px solid grey";
		cell.style.borderRight = "1px solid grey";
		cell.style.width = `${CELL_WIDTH_PX}`;
		return cell;
	}

	renderPhaseRow(data: PhaseResponse, isPhase: boolean) {
		// Row per la fase
		const row = document.createElement("div");
		row.style.height = `${ROW_HEIGHT_PX}`;
		row.className = "d-flex bg-white z-1 phase-row";
		this.pushReference(row, data, isPhase ? "phase" : "subPhase");

		for (let i = 0; i < this.cellsNumber; i++) {
			const date = new Date(this.firstDate);
			date.setDate(this.firstDate.getDate() + i);
			const cell = this.createSingleCell(date);
			cell.textContent = date.getDate().toString();
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

	private handleRightScroll(ref: RowReference, dates: Date[]) {
		for (let i = 0; i < 3; i++) {
			const firstCell = ref.row.firstElementChild;
			if (firstCell) {
				ref.row.removeChild(firstCell);
			}
		}

		for (const date of dates) {
			const newCell = this.createSingleCell(date);
			ref.row.appendChild(newCell);
		}
	}

	private handleLeftScroll(ref: RowReference, dates: Date[]) {
		for (let i = 0; i < 3; i++) {
			const lastCell = ref.row.lastElementChild;
			if (lastCell) {
				ref.row.removeChild(lastCell);
			}
		}

		for (const date of dates) {
			const newCell = this.createSingleCell(date);
			ref.row.insertBefore(newCell, ref.row.firstChild);
		}
	}

	public shiftTimeline(isRightScroll: boolean): void {
		const dates: Date[] = [];
		for (let i = 1; i < 4; i++) {
			const date = new Date(this.firstDate);
			isRightScroll
				? date.setDate(this.firstDate.getDate() + this.cellsNumber + i)
				: date.setDate(this.firstDate.getDate() - i);
			dates.push(date);
		}
		if (isRightScroll) {
			this.rowsArray.forEach((row) => {
				this.handleRightScroll(row, dates);
			});
			this.firstDate.setDate(this.firstDate.getDate() + 3);
		} else {
			this.rowsArray.forEach((row) => {
				this.handleLeftScroll(row, dates);
			});
			this.firstDate.setDate(this.firstDate.getDate() - 3);
		}
	}

	public render(currentDate: Date) {
		this.cellsNumber = calculateCells(this);
		this.firstDate.setDate(
			currentDate.getDate() - Math.floor(this.cellsNumber / 2)
		);

		this.innerHTML = "";

		for (const phase of this.phasesData) {
			const phaseRow = this.renderPhaseRow(phase, true);
			this.appendChild(phaseRow);
		}
	}
}

customElements.define("project-phase-row", ProjectPhaseRow);

export default ProjectPhaseRow;
