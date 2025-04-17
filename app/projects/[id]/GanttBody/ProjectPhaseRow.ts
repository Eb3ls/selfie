import {
	PhaseResponse,
	ProjectActivityResponse,
	SubPhaseResponse
} from "@/app/api/(auth)/project/[id]/route";
import { openActivityForm } from "../Forms/ActivityForm";
import { openPhaseForm } from "../Forms/PhaseForm";
import {
	CELL_WIDTH,
	CELL_WIDTH_PX,
	PhaseToggleMap,
	ROW_HEIGHT_PX,
	calculateCells,
	getToggleState,
	statusConfig
} from "../Utils";

interface RowReference {
	pill: HTMLElement;
	color: string;
	data: PhaseResponse | SubPhaseResponse | ProjectActivityResponse;
	dataType: "activity" | "phase" | "subPhase";
	parentData: SubPhaseResponse | PhaseResponse | null;
}

class ProjectPhaseRow extends HTMLElement {
	firstDate: Date;
	lastDate: Date;
	cellsNumber: number;
	phasesData: PhaseResponse[];
	rowsArray: RowReference[];
	openToggleList: PhaseToggleMap;

	constructor() {
		super();
		this.firstDate = new Date();
		this.lastDate = new Date();
		this.cellsNumber = 0;
		this.phasesData = [];
		this.rowsArray = [];
		this.openToggleList = {};
	}

	loadProjectData(
		data: PhaseResponse[],
		currentDate: Date,
		openToggleList: PhaseToggleMap
	) {
		if (!data) return;
		this.phasesData = data;
		this.openToggleList = openToggleList;
		this.render(currentDate);
	}

	createSingleCell() {
		const cell = document.createElement("div");
		cell.className =
			"d-flex flex-column align-items-center justify-content-center flex-shrink-0";
		cell.style.borderBottom = "1px solid grey";
		cell.style.borderRight = "1px solid grey";
		cell.style.width = `${CELL_WIDTH_PX}`;
		return cell;
	}

	createPill(
		data: PhaseResponse | SubPhaseResponse | ProjectActivityResponse,
		dataType: "activity" | "phase" | "subPhase",
		parentData: SubPhaseResponse | PhaseResponse | null,
		color: string
	): HTMLElement {
		const start = new Date(data.dtStart);
		const due = new Date(data.due);
		const isMilestone = "isMilestone" in data ? data.isMilestone : false;

		const phasePill = document.createElement("div");
		phasePill.className =
			"rounded-pill position-absolute text-white top-50 translate-middle-y d-flex align-items-center justify-content-start px-2";
		phasePill.style.height = "70%";
		phasePill.style.backgroundColor = color;

		if (dataType === "activity") {
			phasePill.setAttribute("data-bs-toggle", "modal");
			phasePill.setAttribute("data-bs-target", "#ModifyActivity");
			const handleClick = () => {
				openActivityForm(
					data as ProjectActivityResponse,
					parentData as PhaseResponse | SubPhaseResponse
				);
			};

			phasePill.addEventListener("click", handleClick);
		} else {
			phasePill.setAttribute("data-bs-toggle", "modal");
			phasePill.setAttribute("data-bs-target", "#ModifyPhase");
			const handleClick = () => {
				openPhaseForm(
					data as PhaseResponse | SubPhaseResponse,
					parentData as PhaseResponse | null
				);
			};

			phasePill.addEventListener("click", handleClick);
		}

		// Calcoliamo le date iniziale e finale in base agli estremi della timeline
		const initialDate = new Date(
			Math.max(this.firstDate.getTime(), start.getTime())
		);
		const finalDate = new Date(
			Math.min(this.lastDate.getTime(), due.getTime())
		);

		// Calcoliamo la larghezza in base alla differenza di giorni
		let width;
		if (initialDate.getTime() > finalDate.getTime()) {
			width = 0;
		} else {
			const diffTime = Math.abs(
				finalDate.getTime() - initialDate.getTime()
			);
			const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
			width = diffDays * CELL_WIDTH;
		}

		// Calcoliamo la posizione left del pill in base alla data iniziale
		let left;
		if (initialDate < this.firstDate) {
			left = 0;
		} else {
			const diffTime = Math.abs(
				initialDate.getTime() - this.firstDate.getTime()
			);
			const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
			left = CELL_WIDTH * diffDays;
		}

		// Togliamo 30px per non farlo iniziare dal bordo
		phasePill.style.width = `${width - 20}px`;
		phasePill.style.left = `${left + 10}px`;

		const textElement = document.createElement("span");
		textElement.className = "fw-bold text-truncate me-2";
		textElement.style.whiteSpace = "nowrap";
		textElement.style.overflow = "hidden";

		if (isMilestone) {
			const flag = document.createElement("i");
			flag.className = "bi bi-flag-fill mx-2";
			textElement.appendChild(flag);
		}

		const textSpan = document.createElement("span");
		textSpan.innerText = data.summary;
		textElement.appendChild(textSpan);

		phasePill.appendChild(textElement);
		return phasePill;
	}

	createRow(
		data: PhaseResponse | SubPhaseResponse | ProjectActivityResponse,
		dataType: "activity" | "phase" | "subPhase",
		parentData: SubPhaseResponse | PhaseResponse | null,
		color: string
	): HTMLElement {
		// Riga principale
		const row = document.createElement("div");
		row.style.height = `${ROW_HEIGHT_PX}`;
		row.className = "d-flex position-relative";
		row.style.width = "max-content";
		const pill = this.createPill(data, dataType, parentData, color);

		this.rowsArray.push({
			pill,
			color,
			data,
			dataType,
			parentData
		});
		row.appendChild(pill);

		for (let i = 0; i < this.cellsNumber; i++) {
			const cell = this.createSingleCell();
			row.appendChild(cell);
		}

		return row;
	}

	renderPhaseRow(
		parentElement: HTMLElement,
		data: PhaseResponse | SubPhaseResponse,
		dataType: "phase" | "subPhase",
		parentData: PhaseResponse | null
	) {
		const color = dataType === "phase" ? "black" : "gray";
		const row = this.createRow(data, dataType, parentData, color);
		parentElement.appendChild(row);

		// Contenitore per il collapse con lo stesso id per fare il toggle di tutti
		const collapse = document.createElement("div");
		collapse.id = `collapse${data._id}`;
		collapse.className = "collapse";
		collapse.style.width = "max-content";

		let hasDataInside = false;

		// Gestione delle sottofasi
		if ("subPhases" in data && data.subPhases.length > 0) {
			hasDataInside = true;
			for (const subPhase of data.subPhases) {
				this.renderPhaseRow(collapse, subPhase, "subPhase", data);
			}
		}

		//Gestione delle attività
		if (data.activities.length > 0) {
			hasDataInside = true;
			for (const activity of data.activities) {
				let color = "";
				if (activity.isOverdue) {
					color = "red";
				} else {
					color =
						statusConfig[
							activity.status as keyof typeof statusConfig
						].color;
				}

				const row = this.createRow(activity, "activity", data, color);
				collapse.appendChild(row);
			}
		}

		if (hasDataInside) {
			parentElement.appendChild(collapse);
			if (
				getToggleState(
					this.openToggleList,
					data._id,
					parentData?._id || null
				)
			) {
				collapse.classList.add("show");
			}
		}
	}

	public shiftTimeline(isRightScroll: boolean): void {
		const offset = isRightScroll ? 3 : -3;
		this.firstDate.setDate(this.firstDate.getDate() + offset);
		this.lastDate.setDate(this.lastDate.getDate() + offset);
		this.rowsArray.forEach((ref) => {
			const pill = this.createPill(
				ref.data,
				ref.dataType,
				ref.parentData,
				ref.color
			);
			ref.pill.replaceWith(pill);
			ref.pill = pill;
		});
	}

	public render(currentDate: Date) {
		this.rowsArray = [];
		this.cellsNumber = calculateCells(this);
		this.firstDate = new Date(currentDate);
		this.firstDate.setDate(
			currentDate.getDate() - Math.floor(this.cellsNumber / 2)
		);
		this.firstDate.setHours(0, 0, 0, 0);
		this.lastDate = new Date(this.firstDate);
		this.lastDate.setDate(this.firstDate.getDate() + this.cellsNumber - 1);
		this.lastDate.setHours(23, 59, 59, 999);
		this.innerHTML = "";
		this.className = "d-flex flex-column overflow-x-hidden";
		for (const phase of this.phasesData) {
			this.renderPhaseRow(this, phase, "phase", null);
		}
	}
}

if (!customElements.get("project-phase-row")) {
	customElements.define("project-phase-row", ProjectPhaseRow);
}

export default ProjectPhaseRow;
