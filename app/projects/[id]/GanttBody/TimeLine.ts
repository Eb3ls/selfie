import * as CONST from "../Utils";

const scrollDistance = 3 * CONST.CELL_WIDTH;

class TimeLine extends HTMLElement {
	private timeline: HTMLElement;
	private firstDate: Date;
	private lastDate: Date;
	private centerDate: Date;
	private isScrolling: boolean;
	private isRightScrolling: boolean;
	private resizeObserver: ResizeObserver | null;

	constructor() {
		super();
		this.timeline = document.createElement("div");
		this.firstDate = new Date();
		this.lastDate = new Date();
		this.centerDate = new Date();
		this.isScrolling = false;
		this.isRightScrolling = false;
		this.resizeObserver = null;
	}

	connectedCallback() {
		this.style.display = "flex";
		this.resizeObserver = new ResizeObserver(() => {
			console.log("Resize observer");
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

	createSingleCell(date: Date) {
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

		cell.appendChild(dayText);
		cell.appendChild(dayNum);

		return cell;
	}

	createCells(currentDate: Date, cols: number = 30) {
		this.timeline.innerHTML = "";
		for (let i = 0; i < cols; i++) {
			const curDate = new Date(this.firstDate);
			curDate.setDate(this.firstDate.getDate() + i);

			const cell = this.createSingleCell(curDate);

			if (curDate.getDate() === currentDate.getDate()) {
				cell.id = "currentDay";
				cell.style.backgroundColor = "#ffcccc";
			}

			this.timeline.appendChild(cell);
		}
	}

	scrollToCenter() {
		const currentDay = document.getElementById("currentDay");
		if (currentDay) {
			currentDay.scrollIntoView({
				block: "center",
				inline: "center"
			});
		} else {
			console.error("Elemento currentDay non trovato");
		}
	}

	calculateCells() {
		const width = this.clientWidth || this.getBoundingClientRect().width;
		console.log("Width:", width);

		const cols = Math.floor((width * 10) / CONST.CELL_WIDTH);
		console.log("Cols:", cols);
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
		this.createCells(date, cells);

		return this.timeline;
	}

	handleLeftScroll() {
		// Aggiungiamo le prime 3 celle
		for (let i = 0; i < 3; i++) {
			const firstDate = new Date(this.firstDate);
			firstDate.setDate(this.firstDate.getDate() - 1);
			const cell = this.createSingleCell(firstDate);
			this.timeline.insertBefore(cell, this.timeline.firstElementChild);
			this.firstDate = firstDate;
		}

		// Rimuoviamo le ultime 3 celle
		for (let i = 0; i < 3; i++) {
			const lastCell = this.timeline.lastElementChild;
			if (lastCell) {
				this.timeline.removeChild(lastCell);
				this.lastDate.setDate(this.lastDate.getDate() - 1);
			}
		}

		// Reset transform e transition
		this.timeline.style.transition = "none";
		this.timeline.style.transform = "translateX(0)";

		this.isScrolling = false;
		console.log("Left scroll");
	}

	handleRightScroll() {
		// Rimuoviamo le prime 3 celle
		for (let i = 0; i < 3; i++) {
			const firstCell = this.timeline.firstElementChild;
			if (firstCell) {
				this.timeline.removeChild(firstCell);
				this.firstDate.setDate(this.firstDate.getDate() + 1);
			}
		}

		// Aggiungiamo le ultime 3 celle
		for (let i = 0; i < 3; i++) {
			const lastDate = new Date(this.lastDate);
			lastDate.setDate(this.lastDate.getDate() + 1);
			const cell = this.createSingleCell(lastDate);
			this.timeline.appendChild(cell);
			this.lastDate = lastDate;
		}

		// Reset transform e transition
		this.timeline.style.transition = "none";
		this.timeline.style.transform = "translateX(0)";

		this.isScrolling = false;
		console.log("Right scroll");
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
			this.isRightScrolling = false;
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
			this.isRightScrolling = true;
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
