import * as CONSTANTS from "./constants";

class TimeLine extends HTMLElement {
	constructor() {
		super();
	}

	static get observedAttributes() {
		return ["date"];
	}

	attributeChangedCallback(name: string, oldValue: string, newValue: string) {
		if (name === "date") {
			this.render(newValue);
		}
	}

	handleTimeline(date: Date) {
		const timeline = document.createElement("div");
		timeline.className = "row bg-white z-1 sticky-top w-100";
		timeline.style.height = `${CONSTANTS.ROW_HEIGHT}`;
		timeline.style.display = "grid";
		timeline.style.gridTemplateColumns = `repeat(${CONSTANTS.COL_NUM}, ${CONSTANTS.CELL_WIDTH})`;
		timeline.style.gap = "0";

		const year = date.toLocaleDateString(CONSTANTS.timeFormat, {
			year: "numeric"
		});
		const month = date.toLocaleDateString(CONSTANTS.timeFormat, {
			month: "long"
		});
		const yearDiv = document.getElementById("yearDiv");
		const monthDiv = document.getElementById("monthDiv");

		if (!yearDiv || !monthDiv) {
			return timeline;
		}

		yearDiv.textContent = year;
		monthDiv.textContent = month;

		const startDate = new Date();
		startDate.setDate(
			date.getDate() - Math.floor(CONSTANTS.COL_NUM / 2) + 2
		);

		for (let i = 0; i < CONSTANTS.COL_NUM; i++) {
			const cell = document.createElement("div");
			cell.className =
				"d-flex flex-column align-items-center justify-content-center";
			cell.style.borderBottom = "1px solid grey";
			cell.style.borderRight = "1px solid grey";

			const curDay = new Date();
			curDay.setDate(startDate.getDate() + i);

			const dayText = document.createElement("div");
			dayText.textContent = curDay.getDate().toString();

			const dayNum = document.createElement("div");
			dayNum.textContent = curDay.toLocaleDateString(
				CONSTANTS.timeFormat,
				{
					weekday: "short"
				}
			);

			cell.appendChild(dayText);
			cell.appendChild(dayNum);

			timeline.appendChild(cell);
		}
		return timeline;
	}

	render(dateString: string) {
		let date = new Date(dateString);
		// Timeline
		const timeline = this.handleTimeline(date);

		this.innerHTML = timeline.outerHTML;
	}
}

customElements.define("time-line", TimeLine);

export default TimeLine;
