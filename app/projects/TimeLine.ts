const row_height = "70px";

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
		timeline.className = "row sticky-top bg-white";
		timeline.style.height = `${row_height}`;
		timeline.style.display = "grid";
		timeline.style.gridTemplateColumns = "repeat(12, 1fr)";
		timeline.style.gap = "0";

		const timeFormat = "en-US";

		const year = date.toLocaleDateString(timeFormat, { year: "numeric" });
		const month = date.toLocaleDateString(timeFormat, { month: "long" });
		const yearDiv = document.getElementById("yearDiv");
		const monthDiv = document.getElementById("monthDiv");

		if (!yearDiv || !monthDiv) {
			return timeline;
		}

		yearDiv.textContent = year;
		monthDiv.textContent = month;

		for (let i = 0; i < 12; i++) {
			const cell = document.createElement("div");
			cell.className =
				"d-flex flex-column align-items-center justify-content-center";
			cell.style.borderBottom = "1px solid grey";
			cell.style.borderRight = "1px solid grey";

			const curDay = new Date();
			curDay.setDate(date.getDate() + i);

			const dayText = document.createElement("div");
			dayText.textContent = curDay.getDate().toString();

			const dayNum = document.createElement("div");
			dayNum.textContent = curDay.toLocaleDateString(timeFormat, {
				weekday: "short"
			});

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
