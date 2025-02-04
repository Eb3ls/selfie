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

	async getData() {
		try {
			const projectID = window.location.pathname.split("/")[2];
			const res = await fetch(`/api/project/${projectID}`);
			const data = await res.json();

			if (!res.ok) {
				throw new Error("Failed to get data");
			}

			return data;
		} catch (error) {
			console.error(error);
			alert("Failed to get data, please try again");
			return null;
		}
	}

	async connectedCallback() {
		try {
			const data = await this.getData();
			if (!data) return;

			const projectSettings = document.querySelector("project-settings") as any;
			const addFormComponent = document.querySelector("add-form-component") as any;
			const sideGanttList = document.querySelector("side-gantt-list") as any;
			const projectPhaseRow = document.querySelector("project-phase-row") as any;

			if (projectSettings && typeof projectSettings.loadProjectData === 'function') {
				projectSettings.loadProjectData(data.summary, data._id, data.users);
			}
			if (addFormComponent && typeof addFormComponent.loadProjectData === 'function') {
				addFormComponent.loadProjectData(data._id, data.phases);
			}
			if (sideGanttList && typeof sideGanttList.loadProjectData === 'function') {
				sideGanttList.loadProjectData(data.phases);
			}
			if (projectPhaseRow && typeof projectPhaseRow.loadProjectData === 'function') {
				projectPhaseRow.loadProjectData(data.phases);
			}
			console.log("Data:", data);

			const mainTitle = document.getElementById("mainTitle");
			if (mainTitle) mainTitle.textContent = data.summary;

			this.syncGanttScroll();
		} catch (error) {
			console.error("Error in connectedCallback:", error);
		}
	}
}

customElements.define("onload-functions", OnLoadFunctions);

export default OnLoadFunctions;
