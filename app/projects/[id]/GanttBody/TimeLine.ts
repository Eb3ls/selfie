import {
	CELL_WIDTH_PX,
	ROW_HEIGHT_PX,
	calculateCells,
	formatDate,
	timeFormat
} from "../Utils";
import ProjectPhaseRow from "./ProjectPhaseRow";

class TimeLine extends HTMLElement {
	private firstDate: Date;
	private lastDate: Date;
	private centerDate: Date;
	private todayDate: Date;
	private isScrolling: boolean;
	private resizeObserver: ResizeObserver | null;
	private phaseRowsHandler: ProjectPhaseRow | null;

	constructor() {
		super();
		this.firstDate = new Date();
		this.lastDate = new Date();
		this.centerDate = new Date();
		this.todayDate = new Date();
		this.isScrolling = false;
		this.resizeObserver = null;
		this.phaseRowsHandler = null;
	}

	connectedCallback() {
		this.style.display = "flex";
		this.resizeObserver = new ResizeObserver(() => {
			// Renderizziamo prima phaseRowsHandler e poi il timeline perché é la timeline a fare lo scroll poi
			this.phaseRowsHandler!.render(this.centerDate);
			this.render();
		});
		this.resizeObserver.observe(this);
	}

	disconnectedCallback() {
		if (this.resizeObserver) {
			this.resizeObserver.disconnect();
		}
	}

	updateMonth() {
		const month = this.centerDate.toLocaleDateString(timeFormat, {
			month: "long"
		});

		const monthDiv = document.getElementById("monthDiv");

		if (!monthDiv) {
			return;
		}

		monthDiv.textContent = month;
	}

	updateYear() {
		const year = this.centerDate.toLocaleDateString(timeFormat, {
			year: "numeric"
		});

		const yearDiv = document.getElementById("yearDiv");

		if (!yearDiv) {
			return;
		}

		yearDiv.textContent = year;
	}

	cellStyling(cell: HTMLElement, date: Date) {
		cell.id = formatDate(date.toISOString());
		cell.children[0].textContent = date.getDate().toString();
		cell.children[1].textContent = date.toLocaleDateString(timeFormat, {
			weekday: "short"
		});
		if (
			formatDate(date.toISOString()) ===
			formatDate(this.todayDate.toISOString())
		) {
			cell.style.backgroundColor = "#ffcccc";
		} else {
			cell.style.backgroundColor = "";
		}
	}

	createSingleCell(date: Date) {
		const cell = document.createElement("div");
		cell.className =
			"d-flex flex-column align-items-center justify-content-center flex-shrink-0";
		cell.style.borderBottom = "1px solid grey";
		cell.style.borderRight = "1px solid grey";
		cell.style.width = `${CELL_WIDTH_PX}`;

		const dayText = document.createElement("div");
		const dayNum = document.createElement("div");
		cell.appendChild(dayText);
		cell.appendChild(dayNum);

		this.cellStyling(cell, date);

		return cell;
	}

	scrollToDate(date: Date) {
		const id = formatDate(date.toISOString());
		const centerBlock = document.getElementById(id);

		if (centerBlock) {
			centerBlock.scrollIntoView({
				block: "center",
				inline: "center"
			});
		} else {
			console.error("Elemento a cui scrollare non trovato: ", id);
		}
	}

	handleScroll(isRight: boolean) {
		let offset = isRight ? 3 : -3;
		let previousDate = new Date(this.centerDate);

		this.firstDate.setDate(this.firstDate.getDate() + offset);
		this.lastDate.setDate(this.lastDate.getDate() + offset);
		this.centerDate.setDate(this.centerDate.getDate() + offset);

		// Aggiorniamo il mese e l'anno se cambiano
		if (this.centerDate.getMonth() !== previousDate.getMonth()) {
			this.updateMonth();
			this.updateYear();
		}

		const date = new Date(this.firstDate);
		for (const cell of this.children) {
			const htmlCell = cell as HTMLElement;
			this.cellStyling(htmlCell, date);
			date.setDate(date.getDate() + 1);
		}

		this.style.scrollBehavior = "auto";
		this.scrollToDate(this.centerDate);
		this.isScrolling = false;
	}

	addEventListeners() {
		const leftScrollBtn = document.getElementById("leftScroll");
		const rightScrollBtn = document.getElementById("rightScroll");

		if (!leftScrollBtn || !rightScrollBtn) {
			console.error("Elementi per lo scroll non trovati");
			return;
		}

		// Aggiungiamo gli event listeners per lo scroll
		// Quando clicchiamo su un bottone facciamo scrollIntoView della nuova data in modo smooth
		// Quando ha finito eliminiamo e aggiungiamo le celle necessarie e riscrolliamo alla data centrale

		this.addEventListener("scroll", () => {
			// Imposta lo scrollLeft del phaseRowsHandler in base a quello del timeline
			this.phaseRowsHandler!.scrollLeft = this.scrollLeft;
		});

		leftScrollBtn.addEventListener("click", () => {
			if (this.isScrolling) return;
			this.isScrolling = true;
			const date = new Date(this.centerDate);
			date.setDate(date.getDate() - 3);
			this.style.scrollBehavior = "smooth";
			this.scrollToDate(date);

			setTimeout(() => {
				this.handleScroll(false);
				this.phaseRowsHandler!.shiftTimeline(false);
			}, 500);
		});

		rightScrollBtn.addEventListener("click", () => {
			if (this.isScrolling) return;
			this.isScrolling = true;
			const date = new Date(this.centerDate);
			date.setDate(date.getDate() + 3);
			this.style.scrollBehavior = "smooth";
			this.scrollToDate(date);

			setTimeout(() => {
				this.handleScroll(true);
				this.phaseRowsHandler!.shiftTimeline(true);
			}, 500);
		});
	}

	public loadData(todayDate: Date) {
		this.todayDate = todayDate;
		// Le date sono passate per riferimento quindi ne creo una nuova
		this.centerDate = new Date(todayDate);
		this.render();
	}

	public render() {
		this.innerHTML = "";
		this.phaseRowsHandler = document.querySelector("project-phase-row");
		if (!this.phaseRowsHandler) {
			console.error("Elemento project-phase-row non trovato");
			return;
		}
		const cells = calculateCells(this);

		this.firstDate = new Date(this.centerDate);
		this.firstDate.setDate(
			this.firstDate.getDate() - Math.floor(cells / 2)
		);
		// Devo considerare anche la cella iniziare quindi aggiungo cells - 1
		this.lastDate = new Date(this.firstDate);
		this.lastDate.setDate(this.firstDate.getDate() + cells - 1);

		this.className = "overflow-hidden d-flex bg-white z-1";
		this.style.height = `${ROW_HEIGHT_PX}`;

		this.updateMonth();
		this.updateYear();

		for (let i = 0; i < cells; i++) {
			const curDate = new Date(this.firstDate);
			curDate.setDate(this.firstDate.getDate() + i);

			const cell = this.createSingleCell(curDate);

			this.appendChild(cell);
		}

		this.addEventListeners();
		this.scrollToDate(this.centerDate);
	}
}

customElements.define("time-line", TimeLine);

export default TimeLine;
