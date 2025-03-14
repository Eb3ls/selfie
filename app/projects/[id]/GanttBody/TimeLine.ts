import * as CONST from "../Utils";

const scrollDistance = 3 * CONST.CELL_WIDTH;

class TimeLine extends HTMLElement {
	private timeline: HTMLElement;
	private firstDate: Date;
	private lastDate: Date;
	private centerDate: Date;
	private isScrolling: boolean;
	private resizeObserver: ResizeObserver | null;

	constructor() {
		super();
		this.timeline = document.createElement("div");
		this.firstDate = new Date();
		this.lastDate = new Date();
		this.centerDate = new Date();
		this.isScrolling = false;
		this.resizeObserver = null;
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
		const month = this.centerDate.toLocaleDateString(CONST.timeFormat, {
			month: "long"
		});

		const monthDiv = document.getElementById("monthDiv");

		if (!monthDiv) {
			return;
		}

		monthDiv.textContent = month;
	}

	updateYear() {
		const year = this.centerDate.toLocaleDateString(CONST.timeFormat, {
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
		cell.style.width = `${CONST.CELL_WIDTH_PX}`;

		const dayText = document.createElement("div");
		dayText.textContent = date.getDate().toString();

		const dayNum = document.createElement("div");
		dayNum.textContent = date.toLocaleDateString(CONST.timeFormat, {
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
		this.timeline.innerHTML = "";
		for (let i = 0; i < cols; i++) {
			const curDate = new Date(this.firstDate);
			curDate.setDate(this.firstDate.getDate() + i);

			const cell = this.createSingleCell(curDate, currentDate);

			this.timeline.appendChild(cell);
		}
	}

	scrollToCenter() {
		const centerBlock = document.getElementById(
			this.centerDate.toISOString()
		);
		if (centerBlock) {
			centerBlock.scrollIntoView({
				block: "center",
				inline: "center"
			});
		} else {
			console.error("Elemento currentDay non trovato");
		}
	}

	calculateCells() {
		const width = this.clientWidth || this.getBoundingClientRect().width;
		const cols = Math.floor((width * 2) / CONST.CELL_WIDTH);

		return cols;
	}

	handleTimeline(date: Date) {
		this.timeline.className = "d-flex bg-white z-1 sticky-top";
		this.timeline.style.height = `${CONST.ROW_HEIGHT_PX}`;

		const cells = this.calculateCells();

		this.firstDate = new Date(date);
		this.firstDate.setDate(date.getDate() - Math.floor(cells / 2));
		this.centerDate = new Date(date);
		this.lastDate = new Date(this.firstDate);
		this.lastDate.setDate(this.firstDate.getDate() + cells);

		this.updateMonth();
		this.updateYear();
		this.createCells(new Date(), cells);

		return this.timeline;
	}

	handleLeftScroll() {
		// Aggiungiamo le prime 3 celle
		for (let i = 1; i <= 3; i++) {
			const firstDate = new Date(this.firstDate);
			firstDate.setDate(this.firstDate.getDate() - i);
			const cell = this.createSingleCell(firstDate, new Date());
			this.timeline.insertBefore(cell, this.timeline.firstElementChild);
		}

		// Rimuoviamo le ultime 3 celle
		for (let i = 0; i < 3; i++) {
			const lastCell = this.timeline.lastElementChild;
			if (lastCell) {
				this.timeline.removeChild(lastCell);
			}
		}

		const previousDate = new Date(this.centerDate);

		this.firstDate.setDate(this.firstDate.getDate() - 3);
		this.lastDate.setDate(this.lastDate.getDate() - 3);
		this.centerDate.setDate(this.centerDate.getDate() - 3);

		// Reset transform e transition
		this.timeline.style.transition = "none";
		this.timeline.style.transform = "translateX(0)";

		// Se il mese è cambiato, aggiorniamo il mese e l'anno
		if (this.centerDate.getMonth() !== previousDate.getMonth()) {
			this.updateMonth();
			this.updateYear();
		}

		this.isScrolling = false;
	}

	handleRightScroll() {
		// Rimuoviamo le prime 3 celle
		for (let i = 0; i < 3; i++) {
			const firstCell = this.timeline.firstElementChild;
			if (firstCell) {
				this.timeline.removeChild(firstCell);
			}
		}

		// Aggiungiamo le ultime 3 celle
		for (let i = 1; i <= 3; i++) {
			const lastDate = new Date(this.lastDate);
			lastDate.setDate(this.lastDate.getDate() + i);
			const cell = this.createSingleCell(lastDate, new Date());
			this.timeline.appendChild(cell);
		}

		const previousDate = new Date(this.centerDate);

		this.firstDate.setDate(this.firstDate.getDate() + 3);
		this.lastDate.setDate(this.lastDate.getDate() + 3);
		this.centerDate.setDate(this.centerDate.getDate() + 3);

		// Se il mese è cambiato, aggiorniamo il mese e l'anno
		if (this.centerDate.getMonth() !== previousDate.getMonth()) {
			this.updateMonth();
			this.updateYear();
		}

		// Reset transform e transition
		this.timeline.style.transition = "none";
		this.timeline.style.transform = "translateX(0)";

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
			this.timeline.style.transition = "transform 0.5s ease";
			this.timeline.style.transform = `translateX(${scrollDistance}px)`;

			// Aggiungiamo un listener one-time per gestire il transitionend
			this.timeline.addEventListener(
				"transitionend",
				() => {
					this.handleLeftScroll();
				},
				{ once: true }
			);
		});

		rightScrollBtn.addEventListener("click", () => {
			if (this.isScrolling) return;
			this.isScrolling = true;
			this.timeline.style.transition = "transform 0.5s ease";
			this.timeline.style.transform = `translateX(${-scrollDistance}px)`;

			// Aggiungiamo un listener one-time per gestire il transitionend
			this.timeline.addEventListener(
				"transitionend",
				() => {
					this.handleRightScroll();
				},
				{ once: true }
			);
		});
	}

	public render(date: Date) {
		// Pulizia del contenuto
		this.timeline.innerHTML = "";

		// Timeline
		this.appendChild(this.handleTimeline(date));
		this.scrollToCenter();

		// Event listeners
		this.addEventListeners();
	}
}

customElements.define("time-line", TimeLine);

export default TimeLine;
