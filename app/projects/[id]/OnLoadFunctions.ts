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
		try {
			this.syncGanttScroll();
		} catch (error) {
			console.error("Error in connectedCallback:", error);
		}
	}
}

customElements.define("onload-functions", OnLoadFunctions);

export default OnLoadFunctions;
