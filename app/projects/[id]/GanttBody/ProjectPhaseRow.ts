import {
	CELL_WIDTH,
	CELL_WIDTH_PX,
	PhaseResponse,
	ProjectActivityResponse,
	ROW_HEIGHT_PX,
	SubPhaseResponse,
	calculateCells,
	formatDate,
	statusConfig
} from "../Utils";

interface RowReference {
	pill: HTMLElement;
	data: {
		summary: string;
		startDate: Date;
		dueDate: Date;
		statusColor: string;
		isMilstone: boolean;
	};
}

class ProjectPhaseRow extends HTMLElement {
	firstDate: Date;
	lastDate: Date;
	cellsNumber: number;
	phasesData: PhaseResponse[];
	rowsArray: RowReference[];

	constructor() {
		super();
		this.firstDate = new Date();
		this.lastDate = new Date();
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
			pill: ref,
			data: {
				summary: data.summary,
				startDate: new Date(data.dtStart),
				dueDate: new Date(data.due),
				statusColor: status,
				isMilstone: "isMilestone" in data ? data.isMilestone : false
			}
		});
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
		text: string,
		color: string,
		isMilestone: boolean,
		start: string,
		due: string
	) {
		const phasePill = document.createElement("div");
		phasePill.className =
			"rounded-pill position-absolute bg-primary text-white top-50 translate-middle-y d-flex align-items-center justify-content-start px-3";
		phasePill.style.height = "70%";

		// Calcoliamo le date iniziale e finale in base agli estremi della timeline
		const initialDate = new Date(
			Math.max(this.firstDate.getTime(), new Date(start).getTime())
		);
		const formattedDue = new Date(formatDate(due));
		const finalDate = new Date(
			Math.min(this.lastDate.getTime(), formattedDue.getTime())
		);

		// Calcoliamo la larghezza in base alla differenza di giorni (attenzione: getDate() funziona se le date sono nello stesso mese)
		let width;
		if (initialDate.getTime() > finalDate.getTime()) {
			width = 0;
		} else {
			const diffTime = Math.abs(
				finalDate.getTime() - initialDate.getTime()
			);
			const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
			width = diffDays * CELL_WIDTH;
		}

		// Calcoliamo la posizione left del pill in base alla data iniziale
		let left;
		if (initialDate.getTime() < this.firstDate.getTime() && this.lastDate) {
			left = 0;
		} else {
			const diffTime = Math.abs(
				initialDate.getTime() - this.firstDate.getTime()
			);
			const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
			left = CELL_WIDTH * diffDays;
		}

		// Togliamo 30px per non farlo iniziare dal bordo
		phasePill.style.width = `${width - 40}px`;
		phasePill.style.left = `${left + 20}px`;

		const textElement = document.createElement("span");
		textElement.innerText = text;
		textElement.style.whiteSpace = "nowrap";
		textElement.style.overflow = "hidden";

		if (isMilestone) {
			const flag = document.createElement("i");
			flag.className = "bi bi-flag-fill";
			textElement.appendChild(flag);
		}

		phasePill.appendChild(textElement);
		return phasePill;
	}

	renderPhaseRow(data: PhaseResponse, isPhase: boolean) {
		// Row per la fase
		const row = document.createElement("div");
		row.style.height = `${ROW_HEIGHT_PX}`;
		row.className = "d-flex bg-white z-1 phase-row position-relative";
		const pill = this.createPill(
			data.summary,
			"primary",
			false,
			data.dtStart,
			data.due
		);

		this.pushReference(pill, data, isPhase ? "phase" : "subPhase");
		row.appendChild(pill);

		for (let i = 0; i < this.cellsNumber; i++) {
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
		const offset = isRightScroll ? 3 : -3;
		this.firstDate.setDate(this.firstDate.getDate() + offset);
		this.lastDate.setDate(this.lastDate.getDate() + offset);
		this.rowsArray.forEach((ref) => {
			const pill = this.createPill(
				ref.data.summary,
				ref.data.statusColor,
				ref.data.isMilstone,
				ref.data.startDate.toISOString(),
				ref.data.dueDate.toISOString()
			);
			ref.pill.replaceWith(pill);
			ref.pill = pill;
		});
	}

	public render(currentDate: Date) {
		this.cellsNumber = calculateCells(this);
		this.firstDate.setDate(
			currentDate.getDate() - Math.floor(this.cellsNumber / 2)
		);
		this.lastDate.setDate(this.firstDate.getDate() + this.cellsNumber - 1);

		this.innerHTML = "";

		for (const phase of this.phasesData) {
			const phaseRow = this.renderPhaseRow(phase, true);
			this.appendChild(phaseRow);
		}
	}
}

customElements.define("project-phase-row", ProjectPhaseRow);

export default ProjectPhaseRow;
