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
	PhaseToggleMap,
	ProjectResponse,
	ROW_HEIGHT,
	ROW_HEIGHT_PX,
	SortedActivity,
	SubPhaseResponse
} from "./Utils";

class ViewToggler extends HTMLElement {
	viewType: "GANTT" | "LIST";
	listViewType: "USER" | "TIME";
	projectData: ProjectResponse | null;
	sortedActivities: SortedActivity[];
	openToggleList: PhaseToggleMap;
	// Salviamo la posizione dello scroll per il gantt
	ganttPositionY: number;
	dateTime: Date | null;

	constructor() {
		super();
		// Inizializziamo la vista sbagliata per forzare il render
		this.viewType = "LIST";
		this.listViewType = "USER";
		this.projectData = null;
		this.sortedActivities = [];
		this.openToggleList = {};
		this.ganttPositionY = 0;
		this.dateTime = null;
	}

	async connectedCallback() {
		this.projectData = await this.getData();
		if (!this.projectData) return;
		this.sortActivies();
		this.populateOpenToggleList();

		// Grafica fissa
		this.className = "d-flex flex-column";
		this.style.height = `calc(100vh - 82px)`;
		this.insertUpperHeader();

		this.render("GANTT");
	}

	private render(viewMode: "GANTT" | "LIST") {
		if (this.viewType === viewMode) return;
		this.viewType = viewMode;
		if (viewMode === "LIST") {
			// Ci salviamo la posizione dello scroll Y per ripristinarlo quando torniamo al gantt
			const ganttContainer = this.querySelector(
				"#ganttContainer"
			) as HTMLElement;
			this.ganttPositionY = ganttContainer.scrollTop;
		}

		// Rimuoviamo i figli eccetto l'upper header
		for (let i = this.children.length - 1; i > 0; i--) {
			this.children[i].remove();
		}

		if (viewMode === "GANTT") {
			this.insertBottomHeader();
			this.insertGanttBody();
			this.addEventListeners();
			const ganttContainer = this.querySelector(
				"#ganttContainer"
			) as HTMLElement;
			ganttContainer.scrollTo(0, this.ganttPositionY);
		} else {
			this.insertBottomHeader();
			this.insertListBody(this.listViewType);
			this.addEventListeners();
		}
	}

	private insertUpperHeader(): void {
		const wrapper = document.createElement("div");
		wrapper.className = "d-flex border-bottom border-secondary px-3";
		wrapper.style.minHeight = ROW_HEIGHT_PX;
		wrapper.innerHTML = `
				<div class="col d-flex align-items-center">
					<a class="btn text-secondary me-1 p-0" href="/projects">
						Dashboard /
					</a>
					<div class="ms-1">${this.projectData!.summary}</div>
				</div>
				<div class="col d-flex justify-content-end align-items-center">
					<add-form-component></add-form-component>
					<project-settings></project-settings>
				</div>
			</div>
		`;

		this.appendChild(wrapper);

		if (!this.projectData) return;
		const addForm = this.querySelector("add-form-component") as AddForm;
		addForm.loadProjectData(
			this.projectData._id,
			this.projectData.phases,
			this.projectData.users
		);

		const projectSettings = this.querySelector(
			"project-settings"
		) as ProjectSettings;
		projectSettings.loadProjectData(
			this.projectData.summary,
			this.projectData._id,
			this.projectData.users
		);

		const activityForm = document.querySelector(
			"activity-form"
		) as ActivityForm;
		if (activityForm) {
			activityForm.loadData(
				this.sortedActivities,
				this.projectData.users
			);
		}
	}

	private insertBottomHeader(): void {
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

		const container = document.createElement("div");
		container.className =
			"d-flex flex-row border-bottom border-secondary align-items-center px-3";
		container.style.minHeight = ROW_HEIGHT_PX;
		container.innerHTML = `
			<div class="col-3 d-flex align-items-center">
				<button class="btn me-2 p-0" id="renderGantt">Gantt</button>
				<button class="btn ms-2 p-0" id="renderList">List</button>
			</div>
			${headerBottom}
		`;

		this.appendChild(container);
	}

	private insertGanttBody(): void {
		const container = document.createElement("div");
		container.className = "row overflow-y-auto g-0";
		container.style.minHeight = `calc(100% - ${ROW_HEIGHT * 2}px)`;
		container.id = "ganttContainer";

		container.innerHTML = `
			<div id="listView" class="col-3 p-0 border-end border-secondary">
				<div id="header" class="d-flex align-items-center sticky-top bg-white border-bottom border-secondary px-5" 
					 style="height: ${ROW_HEIGHT_PX};">
					<div class="col-6">Titolo</div>
					<div class="col-6 d-flex justify-content-center">Range</div>
				</div>
				<side-gantt-list/>
			</div>
			<div id="ganttView" class="col-9 p-0 d-flex flex-column">
				<time-line></time-line>
				<project-phase-row></project-phase-row>
			</div>
		`;

		this.appendChild(container);

		if (!this.projectData) return;

		const sideGanttList = this.querySelector(
			"side-gantt-list"
		) as SideGanttList;
		sideGanttList.loadProjectData(
			this.projectData.phases,
			this.openToggleList
		);

		const projectPhaseRow = this.querySelector(
			"project-phase-row"
		) as ProjectPhaseRow;
		projectPhaseRow.loadProjectData(
			this.projectData.phases,
			this.dateTime || new Date(),
			this.openToggleList
		);

		const timeLine = this.querySelector("time-line") as TimeLine;
		timeLine.loadProjectData(this.dateTime || new Date());
	}

	private insertListBody(view: "USER" | "TIME"): void {
		// Impostiamo la nuova vista corrente
		this.listViewType = view;
		// Creiamo il container per gestire l'overflow
		const container = document.createElement("div");
		container.className = "row overflow-y-auto g-0";
		container.style.minHeight = `calc(100% - ${ROW_HEIGHT * 2}px)`;

		if (this.listViewType === "USER") {
			const listBlock = document.createElement("users-list") as UsersList;
			listBlock.loadProjectData(this.projectData!.phases);
			container.appendChild(listBlock);
		} else {
			const listBlock = document.createElement("time-list") as TimeList;
			listBlock.loadProjectData(this.sortedActivities);
			container.appendChild(listBlock);
		}

		this.appendChild(container);
	}

	private addEventListeners() {
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

			if (this.listViewType === "USER") {
				userSortBtn.classList.add("fw-bold");
				timeSortBtn.classList.add("fw-light");
			} else {
				timeSortBtn.classList.add("fw-bold");
				userSortBtn.classList.add("fw-light");
			}

			userSortBtn.addEventListener("click", () => {
				if (this.listViewType === "USER") return;
				this.children[this.children.length - 1].remove();
				this.insertListBody("USER");
				userSortBtn.classList.replace("fw-light", "fw-bold");
				timeSortBtn.classList.replace("fw-bold", "fw-light");
			});

			timeSortBtn.addEventListener("click", () => {
				if (this.listViewType === "TIME") return;
				this.children[this.children.length - 1].remove();
				this.insertListBody("TIME");
				timeSortBtn.classList.replace("fw-light", "fw-bold");
				userSortBtn.classList.replace("fw-bold", "fw-light");
			});
		} else {
			listBtn.classList.add("fw-light");
			ganttBtn.classList.add("fw-bold");
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
			console.warn("Failed to get data:", error);
			const errorContainer = document.createElement("div");
			errorContainer.className = "container-fluid p-3";

			errorContainer.innerHTML = `
				<div class="alert alert-danger d-flex align-items-center" role="alert">
					<i class="bi bi-exclamation-triangle-fill me-2"></i>
					<div>
						Unable to load project data. 
						<button class="btn btn-link p-0 ms-2" onclick="location.reload()">Try again</button>
					</div>
				</div>
			`;
			this.appendChild(errorContainer);

			return null;
		}
	}

	// Funzione che dato un array di fasi ritorna un array ordinato sulla due di SortedActivity
	private sortActivies(): void {
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

		if (!this.projectData) return;
		for (const phase of this.projectData.phases) {
			apppendActivities(phase);
		}

		allActivities.sort((a, b) => {
			return a.due < b.due ? -1 : 1;
		});

		this.sortedActivities = allActivities;
	}

	private populateOpenToggleList() {
		for (const phase of this.projectData!.phases) {
			this.openToggleList[phase._id] = {
				isOpen: false,
				subPhases: {}
			};

			if (!("subPhases" in phase)) continue;
			for (const subPhase of phase.subPhases) {
				this.openToggleList[phase._id].subPhases[subPhase._id] = false;
			}
		}
	}
}

customElements.define("view-toggler", ViewToggler);

export default ViewToggler;
