import * as CONSTANT from "./constants";

class OnLoadFunctions extends HTMLElement {
	constructor() {
		super();
	}

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

			ganttView.scrollLeft = scrollLeft;
		} else {
			console.error("Elementi per centrare la data corrente non trovati");
		}
	}

	syncGanttScroll() {
		const ganttView = document.getElementById("ganttView");
		const listView = document.getElementById("listView");

		if (ganttView && listView) {
			ganttView.addEventListener("scroll", () => {
				listView.scrollTop = ganttView.scrollTop;
			});

			listView.addEventListener("scroll", () => {
				ganttView.scrollTop = listView.scrollTop;
			});
		} else {
			console.error("Elementi per sincronizzare lo scroll non trovati");
		}
	}

	async connectedCallback() {
		await customElements.whenDefined("project-phase");
		await customElements.whenDefined("project-phase-row");
		await customElements.whenDefined("time-line");

		this.scrollToCenter();
		this.syncGanttScroll();
	}
}

customElements.define("onload-functions", OnLoadFunctions);

export default OnLoadFunctions;
