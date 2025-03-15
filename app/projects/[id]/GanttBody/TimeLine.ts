import {
	CELL_WIDTH_PX,
	ROW_HEIGHT_PX,
	calculateCells,
	timeFormat
} from "../Utils";
import ProjectPhaseRow from "./ProjectPhaseRow";

class TimeLine extends HTMLElement {
	private firstDate: Date;
	private lastDate: Date;
	private centerDate: Date;
	private isScrolling: boolean;
	private resizeObserver: ResizeObserver | null;
	private phaseRowsHandler: ProjectPhaseRow | null;

	constructor() {
		super();
		this.firstDate = new Date();
		this.lastDate = new Date();
		this.centerDate = new Date();
		this.isScrolling = false;
		this.resizeObserver = null;
		this.phaseRowsHandler = null;
	}

	connectedCallback() {
		this.style.display = "flex";
		this.resizeObserver = new ResizeObserver(() => {
			this.render(this.centerDate);
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

	createSingleCell(date: Date, currentDate: Date) {
		const cell = document.createElement("div");
		cell.className =
			"d-flex flex-column align-items-center justify-content-center flex-shrink-0";
		cell.style.borderBottom = "1px solid grey";
		cell.style.borderRight = "1px solid grey";
		cell.style.width = `${CELL_WIDTH_PX}`;

		const dayText = document.createElement("div");
		dayText.textContent = date.getDate().toString();

		const dayNum = document.createElement("div");
		dayNum.textContent = date.toLocaleDateString(timeFormat, {
			weekday: "short"
		});

		cell.id = date.toISOString();

		if (
			date.toISOString().split("T")[0] ===
			currentDate.toISOString().split("T")[0]
		) {
			cell.style.backgroundColor = "#ffcccc";
		}

		cell.appendChild(dayText);
		cell.appendChild(dayNum);

		return cell;
	}

	createCells(currentDate: Date, cols: number = 30) {
		for (let i = 0; i < cols; i++) {
			const curDate = new Date(this.firstDate);
			curDate.setDate(this.firstDate.getDate() + i);

			const cell = this.createSingleCell(curDate, currentDate);

			this.appendChild(cell);
		}
	}

	scrollToDate(date: Date) {
		// TODO: controllare, a volte non lo trova senza motivo
		const centerBlock = document.getElementById(date.toISOString());

		if (centerBlock) {
			centerBlock.scrollIntoView({
				block: "center",
				inline: "center"
			});
		} else {
			console.error("Elemento currentDay non trovato");
		}
	}

	handleTimeline(date: Date) {
		this.className = "d-flex bg-white z-1";
		this.style.height = `${ROW_HEIGHT_PX}`;

		const cells = calculateCells(this);

		this.firstDate = new Date(date);
		this.firstDate.setDate(date.getDate() - Math.floor(cells / 2));
		this.centerDate = new Date(date);
		this.lastDate = new Date(this.firstDate);
		this.lastDate.setDate(this.firstDate.getDate() + cells);

		this.updateMonth();
		this.updateYear();
		this.createCells(new Date(), cells);
	}

	handleScroll(isRight: boolean) {
		let offset;
		let previousDate = new Date(this.centerDate);

		if (!isRight) {
			// Rimuoviamo le celle finali e aggiungiamo quelle iniziali
			offset = -3;
			for (let i = 1; i <= 3; i++) {
				const newDate = new Date(this.firstDate);
				newDate.setDate(this.firstDate.getDate() - i);
				const cell = this.createSingleCell(newDate, new Date());
				this.insertBefore(cell, this.firstElementChild);
			}

			for (let i = 0; i < offset; i++) {
				const lastCell = this.lastElementChild;
				if (lastCell) {
					this.removeChild(lastCell);
				}
			}
		} else {
			// Rimuoviamo le celle iniziali e aggiungiamo quelle finali
			offset = 3;
			for (let i = 0; i < 3; i++) {
				const firstCell = this.firstElementChild;
				if (firstCell) {
					this.removeChild(firstCell);
				}
			}

			for (let i = 1; i <= offset; i++) {
				const newDate = new Date(this.lastDate);
				newDate.setDate(this.lastDate.getDate() + i);
				const cell = this.createSingleCell(newDate, new Date());
				this.appendChild(cell);
			}
		}

		this.firstDate.setDate(this.firstDate.getDate() + offset);
		this.lastDate.setDate(this.lastDate.getDate() + offset);
		this.centerDate.setDate(this.centerDate.getDate() + offset);

		// Aggiorniamo il mese e l'anno se cambiano
		if (this.centerDate.getMonth() !== previousDate.getMonth()) {
			this.updateMonth();
			this.updateYear();
		}

		this.parentElement!.style.scrollBehavior = "auto";
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

		leftScrollBtn.addEventListener("click", () => {
			if (this.isScrolling) return;
			this.isScrolling = true;
			const date = new Date(this.centerDate);
			date.setDate(date.getDate() - 3);
			this.parentElement!.style.scrollBehavior = "smooth";
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
			this.parentElement!.style.scrollBehavior = "smooth";
			this.scrollToDate(date);

			setTimeout(() => {
				this.handleScroll(true);
				this.phaseRowsHandler!.shiftTimeline(true);
			}, 500);
		});
	}

	public render(date: Date) {
		this.innerHTML = "";
		this.phaseRowsHandler = document.querySelector("project-phase-row");
		if (!this.phaseRowsHandler) {
			console.error("Elemento project-phase-row non trovato");
			return;
		}

		this.handleTimeline(date);
		this.scrollToDate(date);

		this.addEventListeners();
	}
}

customElements.define("time-line", TimeLine);

export default TimeLine;
