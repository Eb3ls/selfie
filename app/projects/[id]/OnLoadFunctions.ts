class OnLoadFunctions extends HTMLElement {
	constructor() {
		super();
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

		this.syncGanttScroll();
	}
}

customElements.define("onload-functions", OnLoadFunctions);

export default OnLoadFunctions;
