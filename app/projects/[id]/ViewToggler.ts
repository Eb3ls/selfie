import ActivityForm from "./Forms/ActivityForm";
import AddForm from "./Forms/AddForm";
import ProjectSettings from "./Forms/ProjectSettings";
import ProjectPhaseRow from "./GanttBody/ProjectPhaseRow";
import SideGanttList from "./GanttBody/SideGanttList";
import TimeLine from "./GanttBody/TimeLine";
import TimeList from "./ListBody/TimeList";
import UsersList from "./ListBody/UserList";
import {
	PhaseResponse,
	ProjectResponse,
	ROW_HEIGHT,
	ROW_HEIGHT_PX,
	SortedActivity,
	SubPhaseResponse,
	User
} from "./Utils";

class ViewToggler extends HTMLElement {
	viewType: "GANTT" | "LIST";
	listViewType: "USER" | "TIME";
	projectData: ProjectResponse | null;
	sortedActivities: SortedActivity[];

	constructor() {
		super();
		// Inizializziamo la vista sbagliata per forzare il render
		this.viewType = "LIST";
		this.listViewType = "USER";
		this.projectData = null;
		this.sortedActivities = [];
	}

	async connectedCallback() {
		this.projectData = await this.getData();
		if (!this.projectData) return;
		this.sortedActivities = this.sortActivies(this.projectData.phases);
		this.className = "d-flex flex-column";
		this.style.height = `calc(100vh - 82px)`;
		this.render("GANTT");
	}

	render(viewMode: "GANTT" | "LIST") {
		if (this.viewType === viewMode) return;
		this.viewType = viewMode;

		if (viewMode === "GANTT") {
			this.innerHTML = this.getHeaderTemplate() + this.getGanntBody();
			this.addEventListeners();
			this.loadData();
		} else {
			this.innerHTML = this.getHeaderTemplate();
			const body = this.getListBody(this.listViewType);
			this.appendChild(body);
			this.addEventListeners();
		}
	}

	getHeaderTemplate() {
		const headerTop = `
			<div class="d-flex border-bottom border-secondary px-3" style="min-height: ${ROW_HEIGHT_PX};">
				<div class="col d-flex align-items-center">
					<a class="btn text-secondary me-1 p-0" href="/projects">
						Dashboard /
					</a>
					<div class="ms-1">${this.projectData?.summary}</div>
				</div>
				<div class="col d-flex justify-content-end align-items-center">
					<add-form-component></add-form-component>
					<project-settings></project-settings>
				</div>
			</div>`;

		const headerBottom =
			this.viewType === "GANTT"
				? `
				<div class="col-9 d-flex flex-row justify-content-between">
					<button class="btn p-0 me-2" id="leftScroll">
						<i class="bi bi-chevron-left"></i>
					</button>
					<div class="d-flex flex-column align-items-center">
						<div class="fs-5 fw-bold" id="yearDiv"></div>
						<div class="fs-6 fw-semibold" id="monthDiv"></div>
					</div>
					<button class="btn p-0 ms-2" id="rightScroll">
						<i class="bi bi-chevron-right"></i>
					</button>
				</div>`
				: `
				<div class="col-9 d-flex justify-content-end">
					<button class="btn" id="userSort">Attore</button>
					<button class="btn" id="timeSort">Temporalmente</button>
				</div>`;

		return `
			${headerTop}
			<div class="d-flex flex-row border-bottom border-secondary align-items-center px-3" style="min-height: ${ROW_HEIGHT_PX}">
				<div class="col-3 d-flex align-items-center">
					<button class="btn me-2 p-0" id="renderGantt">Gantt</button>
					<button class="btn ms-2 p-0" id="renderList">List</button>
				</div>
				${headerBottom}
			</div>
			`;
	}

	getGanntBody() {
		return `
            <div class="row overflow-y-auto g-0" style="min-height: calc(100% - ${ROW_HEIGHT * 2}px)">
				<div id="listView" class="col-3 p-0 border-end border-secondary">
					<div id="header" class="d-flex align-items-center sticky-top bg-white border-bottom border-secondary px-5" style="height: ${ROW_HEIGHT_PX};">
						<div class="col-6">Titolo</div>
						<div class="col-6 d-flex justify-content-center">Range</div>
					</div>
					<side-gantt-list/>
				</div>
				<div id="ganttView" class="col-9 p-0 d-flex flex-column">
					<time-line></time-line>
					<project-phase-row></project-phase-row>
				</div>
         </div>
        `;
	}

	getListBody(view: "USER" | "TIME") {
		// Invertiamo la visualizzazione
		this.listViewType = view;
		if (this.listViewType === "USER") {
			const listBlock = document.createElement("users-list") as UsersList;
			if (this.projectData) {
				listBlock.loadData(this.projectData.phases);
			}
			return listBlock;
		} else {
			const listBlock = document.createElement("time-list") as TimeList;
			if (this.projectData) {
				listBlock.loadData(this.sortedActivities);
			}
			return listBlock;
		}
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

	addEventListeners() {
		const ganttBtn = this.querySelector(
			"#renderGantt"
		) as HTMLButtonElement;
		const listBtn = this.querySelector("#renderList") as HTMLButtonElement;

		ganttBtn.addEventListener("click", () => {
			this.render("GANTT");
		});

		listBtn.addEventListener("click", () => {
			this.render("LIST");
		});

		if (this.viewType === "LIST") {
			listBtn.classList.add("fw-bold");
			ganttBtn.classList.add("fw-light");

			const userSortBtn = this.querySelector(
				"#userSort"
			) as HTMLButtonElement;
			const timeSortBtn = this.querySelector(
				"#timeSort"
			) as HTMLButtonElement;

			userSortBtn.addEventListener("click", () => {
				if (this.listViewType === "USER") return;
				const body = this.querySelector("time-list");
				if (!body) return;
				body.replaceWith(this.getListBody("USER"));
			});

			timeSortBtn.addEventListener("click", () => {
				if (this.listViewType === "TIME") return;
				const body = this.querySelector("users-list");
				if (!body) return;
				body.replaceWith(this.getListBody("TIME"));
			});
		} else {
			listBtn.classList.add("fw-light");
			ganttBtn.classList.add("fw-bold");

			this.syncGanttScroll();
		}
	}

	async getData(): Promise<ProjectResponse | null> {
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
			console.warn("Failed to get data, please try again");
			return null;
		}
	}

	// Funzione che dato un array di fasi ritorna un array ordinato sulla due di SortedActivity
	sortActivies(phases: PhaseResponse[]): SortedActivity[] {
		const allActivities: SortedActivity[] = [];

		function apppendActivities(phase: PhaseResponse | SubPhaseResponse) {
			for (const activity of phase.activities) {
				const act = activity as SortedActivity;
				act.parentPhase = phase as PhaseResponse;
				allActivities.push(act);
			}

			if (!("subPhases" in phase)) return;
			for (const subPhase of phase.subPhases) {
				apppendActivities(subPhase);
			}
		}

		if (!this.projectData) return allActivities;
		for (const phase of phases) {
			apppendActivities(phase);
		}

		allActivities.sort((a, b) => {
			return a.due < b.due ? -1 : 1;
		});

		return allActivities;
	}

	loadData() {
		if (!this.projectData) return;
		const usersAvaiable = this.projectData.users.map(
			(user: User) => user.name
		);

		const projectSettings = document.querySelector(
			"project-settings"
		) as ProjectSettings;
		if (projectSettings) {
			projectSettings.loadData(
				this.projectData.summary,
				this.projectData._id,
				this.projectData.users
			);
		}

		const addFormComponent = document.querySelector(
			"add-form-component"
		) as AddForm;
		if (addFormComponent) {
			addFormComponent.loadProjectData(
				this.projectData._id,
				this.projectData.phases,
				usersAvaiable
			);
		}

		const activityForm = document.querySelector(
			"activity-form"
		) as ActivityForm;
		if (activityForm) {
			activityForm.loadData(this.sortedActivities, usersAvaiable);
		}

		const sideGanttList = document.querySelector(
			"side-gantt-list"
		) as SideGanttList;
		if (sideGanttList) {
			sideGanttList.loadProjectData(this.projectData.phases);
		}

		const projectPhaseRow = document.querySelector(
			"project-phase-row"
		) as ProjectPhaseRow;
		if (projectPhaseRow) {
			projectPhaseRow.loadProjectData(
				this.projectData.phases,
				new Date()
			);
		}

		const timeLine = document.querySelector("time-line") as TimeLine;
		if (timeLine) {
			timeLine.loadData(new Date());
		}

		const mainTitle = document.getElementById("mainTitle");
		if (mainTitle) mainTitle.textContent = this.projectData.summary;
	}
}

customElements.define("view-toggler", ViewToggler);

export default ViewToggler;
