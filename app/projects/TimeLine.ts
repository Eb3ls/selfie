import * as CONSTANTS from "./constants";

class TimeLine extends HTMLElement {
	private timeline: HTMLElement;
	private lastScrollLeft: number;
	private isScrolling: boolean;

	constructor() {
		super();
		this.lastScrollLeft = 0;
		this.timeline = document.createElement("div");
		this.isScrolling = false;
	}

	static get observedAttributes() {
		return ["date"];
	}

	attributeChangedCallback(name: string, oldValue: string, newValue: string) {
		if (name === "date") {
			this.render(newValue);
		}
	}

	handleMonth(date: Date) {
		const month = date.toLocaleDateString(CONSTANTS.timeFormat, {
			month: "long"
		});

		const monthDiv = document.getElementById("monthDiv");

		if (!monthDiv) {
			return;
		}

		monthDiv.textContent = month;
	}

	handleYear(date: Date) {
		const year = date.toLocaleDateString(CONSTANTS.timeFormat, {
			year: "numeric"
		});

		const yearDiv = document.getElementById("yearDiv");

		if (!yearDiv) {
			return;
		}

		yearDiv.textContent = year;
	}

	createCells(startDate: Date, currentDate: Date) {
		for (let i = 0; i < CONSTANTS.COL_NUM; i++) {
			const cell = document.createElement("div");
			cell.className =
				"d-flex flex-column align-items-center justify-content-center";
			cell.style.borderBottom = "1px solid grey";
			cell.style.borderRight = "1px solid grey";

			const curDate = new Date();
			curDate.setDate(startDate.getDate() + i);

			if (curDate.getDate() === currentDate.getDate()) {
				cell.id = "currentDay";
				cell.style.backgroundColor = "#ffcccc";
			}

			const dayText = document.createElement("div");
			dayText.textContent = curDate.getDate().toString();

			const dayNum = document.createElement("div");
			dayNum.textContent = curDate.toLocaleDateString(
				CONSTANTS.timeFormat,
				{
					weekday: "short"
				}
			);

			cell.appendChild(dayText);
			cell.appendChild(dayNum);

			this.timeline.appendChild(cell);
		}
	}

	handleScrollLeft(cellScrolled: number) {
		for (let i = 0; i < cellScrolled; i++) {
			const newDiv = document.createElement("div");
			newDiv.style.borderBottom = "1px solid grey";
			newDiv.style.borderRight = "1px solid grey";
			newDiv.style.height = CONSTANTS.ROW_HEIGHT_PX;
			newDiv.style.width = CONSTANTS.CELL_WIDTH_PX;
			newDiv.textContent = "New Cell";
			this.timeline.prepend(newDiv);
			this.timeline.removeChild(
				this.timeline.children[this.timeline.children.length - 1]
			);
		}
	}
	handleScrollRight(cellScrolled: number) {
		for (let i = 0; i < cellScrolled; i++) {
			const newDiv = document.createElement("div");
			newDiv.style.borderBottom = "1px solid grey";
			newDiv.style.borderRight = "1px solid grey";
			newDiv.style.height = CONSTANTS.ROW_HEIGHT_PX;
			newDiv.style.width = CONSTANTS.CELL_WIDTH_PX;
			newDiv.textContent = "New Cell";
			this.timeline.appendChild(newDiv);
			this.timeline.removeChild(this.timeline.children[0]);
		}
	}

	handleScroll = (event: Event) => {
		if (this.isScrolling) return; // Se già in esecuzione, esci

		const target = event.target as HTMLElement;
		const scroll = target.scrollLeft - this.lastScrollLeft;
		const cellScrolled = Math.abs(
			Math.floor(scroll / CONSTANTS.CELL_WIDTH)
		);

		if (cellScrolled !== 0) {
			this.isScrolling = true; // Imposta il flag su true

			if (scroll < 0) {
				this.handleScrollLeft(cellScrolled);
				target.scrollLeft = target.scrollLeft - scroll;
			} else {
				this.handleScrollRight(cellScrolled);
				target.scrollLeft = target.scrollLeft - scroll;
			}
			this.isScrolling = false;
		}
	};

	scrollToCenter() {
		const ganttView = document.getElementById("ganttView");
		const currentDay = document.getElementById("currentDay");
		if (ganttView && currentDay) {
			const currentDateWidth = currentDay.offsetWidth;
			const ganttViewWidth = ganttView.offsetWidth;

			const scrollLeft =
				currentDay.offsetLeft -
				ganttViewWidth / 2 +
				currentDateWidth / 2;

			this.lastScrollLeft = scrollLeft;
			ganttView.scrollLeft = scrollLeft;
		} else {
			console.error("Elementi per centrare la data corrente non trovati");
		}
	}

	handleTimeline(date: Date) {
		const fragment = document.createDocumentFragment();
		this.timeline.className = "bg-white z-1 sticky-top";
		this.timeline.style.height = `${CONSTANTS.ROW_HEIGHT_PX}`;
		this.timeline.style.display = "grid";
		this.timeline.style.gridTemplateColumns = `repeat(${CONSTANTS.COL_NUM}, ${CONSTANTS.CELL_WIDTH_PX})`;
		this.timeline.style.gap = "0";
		this.timeline.style.width =
			CONSTANTS.CELL_WIDTH * CONSTANTS.COL_NUM + "px";

		fragment.appendChild(this.timeline);

		const startDate = new Date();
		startDate.setDate(
			date.getDate() - Math.floor(CONSTANTS.COL_NUM / 2) + 1
		);

		this.handleMonth(date);
		this.handleYear(date);
		this.createCells(startDate, date);

		return fragment;
	}

	render(dateString: string) {
		let date = new Date(dateString);
		// Timeline
		this.appendChild(this.handleTimeline(date));
		this.scrollToCenter();

		const ganttView = document.getElementById("ganttView");

		if (!ganttView) {
			return;
		}

		ganttView.addEventListener("scroll", this.handleScroll);
	}
}

customElements.define("time-line", TimeLine);

export default TimeLine;
