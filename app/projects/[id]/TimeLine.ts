import * as CONST from "./constants";

class TimeLine extends HTMLElement {
	private timeline: HTMLElement;
	private startScroll: number;
	private firstDate: Date;
	private lastDate: Date;
	private centerDate: Date;
	private scrollTimeout: NodeJS.Timeout | null;

	constructor() {
		super();
		this.startScroll = 0;
		this.timeline = document.createElement("div");
		this.firstDate = new Date();
		this.lastDate = new Date();
		this.centerDate = new Date();
		this.scrollTimeout = null;
	}

	static get observedAttributes() {
		return ["date"];
	}

	attributeChangedCallback(name: string, oldValue: string, newValue: string) {
		if (name === "date") {
			this.render(newValue);
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
			"d-flex flex-column align-items-center justify-content-center";
		cell.style.borderBottom = "1px solid grey";
		cell.style.borderRight = "1px solid grey";

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

	createCells(currentDate: Date) {
		for (let i = 0; i < CONST.COL_NUM; i++) {
			const curDate = new Date();
			curDate.setDate(this.firstDate.getDate() + i);

			const cell = this.createSingleCell(curDate);

			if (curDate.getDate() === currentDate.getDate()) {
				cell.id = "currentDay";
				cell.style.backgroundColor = "#ffcccc";
			}

			this.timeline.appendChild(cell);
		}
	}

	handleScrollLeft(cellScrolled: number) {
		for (let i = 0; i < cellScrolled; i++) {
			this.firstDate.setDate(this.firstDate.getDate() - 1);
			this.lastDate.setDate(this.lastDate.getDate() - 1);
			const cell = this.createSingleCell(this.firstDate);
			this.timeline.prepend(cell);
			this.timeline.removeChild(
				this.timeline.children[this.timeline.children.length - 1]
			);
			this.centerDate.setDate(this.centerDate.getDate() + cellScrolled);
		}
	}

	handleScrollRight(cellScrolled: number) {
		for (let i = 0; i < cellScrolled; i++) {
			this.firstDate.setDate(this.firstDate.getDate() + 1);
			this.lastDate.setDate(this.lastDate.getDate() + 1);
			const cell = this.createSingleCell(this.lastDate);
			this.timeline.appendChild(cell);
			this.timeline.removeChild(this.timeline.children[0]);
		}
		this.centerDate.setDate(this.centerDate.getDate() - cellScrolled);
	}

	handleScroll = (event: Event) => {
		if (this.scrollTimeout) {
			clearTimeout(this.scrollTimeout);
		}
		this.scrollTimeout = setTimeout(() => {
			const target = event.target as HTMLElement;
			const scroll = target.scrollLeft - this.startScroll;
			const cellScrolled = Math.floor(
				Math.abs(scroll) / CONST.CELL_WIDTH
			);
			console.log(cellScrolled);
			console.log(scroll);

			if (cellScrolled !== 0) {
				const prevCenterDate = new Date(this.centerDate);

				if (scroll < 0) {
					this.handleScrollLeft(cellScrolled);
					target.scrollLeft = target.scrollLeft - scroll;
				} else {
					this.handleScrollRight(cellScrolled);
					target.scrollLeft = target.scrollLeft - scroll;
				}

				if (prevCenterDate.getMonth() !== this.centerDate.getMonth()) {
					this.updateMonth();
				}
				if (
					prevCenterDate.getFullYear() !==
					this.centerDate.getFullYear()
				) {
					this.updateYear();
				}
			}
		}, 1000);
	};

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

		const ganttView = document.getElementById("ganttView");
		if (ganttView) {
			this.startScroll = ganttView.scrollLeft;
		} else {
			console.error("Elemento ganttView non trovato");
		}
	}

	handleTimeline(date: Date) {
		const fragment = document.createDocumentFragment();
		this.timeline.className = "bg-white z-1 sticky-top";
		this.timeline.style.height = `${CONST.ROW_HEIGHT_PX}`;
		this.timeline.style.display = "grid";
		this.timeline.style.gridTemplateColumns = `repeat(${CONST.COL_NUM}, ${CONST.CELL_WIDTH_PX})`;
		this.timeline.style.gap = "0";
		this.timeline.style.width = CONST.CELL_WIDTH * CONST.COL_NUM + "px";

		fragment.appendChild(this.timeline);

		this.firstDate.setDate(date.getDate() - Math.floor(CONST.COL_NUM / 2));
		this.centerDate = new Date(date);
		this.lastDate.setDate(this.firstDate.getDate() + CONST.COL_NUM);

		this.updateMonth();
		this.updateYear();
		this.createCells(date);

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
