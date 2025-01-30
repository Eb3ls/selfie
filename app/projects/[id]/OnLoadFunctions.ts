class OnLoadFunctions extends HTMLElement {
	constructor() {
		super();
	}

	syncGanttScroll() {
		const ganttView = document.getElementById("ganttView");
		const listView = document.getElementById("listView");

		let isSyncingScroll = false;

		if (ganttView && listView) {
			ganttView.addEventListener("scroll", () => {
				if (!isSyncingScroll) {
					isSyncingScroll = true;
					listView.scrollTop = ganttView.scrollTop;
					requestAnimationFrame(() => {
						isSyncingScroll = false;
					});
				}
			});
	
			listView.addEventListener("scroll", () => {
				if (!isSyncingScroll) {
					isSyncingScroll = true;
					ganttView.scrollTop = listView.scrollTop;
					requestAnimationFrame(() => {
						isSyncingScroll = false;
					});
				}
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
