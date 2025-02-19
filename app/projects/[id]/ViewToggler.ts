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
		this.render("GANTT");
	}

	render(viewMode: "GANTT" | "LIST") {
		if (this.viewType === viewMode) return;
		this.viewType = viewMode;

		if (viewMode === "GANTT") {
			this.innerHTML = `
                ${this.getHeaderTemplate()}
                ${this.getGanntBody()}
            `;
			this.addEventListeners();
			this.loadData();
		} else {
			this.innerHTML = `
                ${this.getHeaderTemplate()}
            `;
			const body = this.getListBody(this.listViewType);
			this.appendChild(body);
			this.addEventListeners();
		}
	}

	getHeaderTemplate() {
		let block;
		if (this.viewType === "GANTT") {
			block = `
                <div class="col-9 d-flex flex-column align-items-center">
                    <div class="fs-4" id="yearDiv"></div>
                    <div class="fs-5" id="monthDiv"></div>
                </div>
            `;
		} else {
			block = `
                <div class="col-9 d-flex justify-content-end">
                    <button class="btn" id="userSort">Attore</button>
                    <button class="btn" id="timeSort">Temporalmente</button>
                </div>
            `;
		}

		return `
            <div class="row p-3 border-bottom border-secondary">
                <div class="col-3 d-flex align-items-center">
                    <button class="btn me-2 p-0" id="renderGantt">Gantt</button>
                    <button class="btn ms-2 p-0" id="renderList">List</button>
                </div>
                ${block}
            </div>
        `;
	}

	getGanntBody() {
		return `
            <div class="row border-bottom border-secondary" style="height: 500px;">
            <div id="listView"
                class="col-3 hide-scroll z-2 border-end border-secondary bg-white mh-100 overflow-y-auto"
                style="position: sticky; left: 0;">
                <div id="header" class="row p-3 border-bottom border-secondary sticky-top bg-white" style="min-height: ${ROW_HEIGHT_PX};">
                    <div class="col-6">Titolo</div>
                    <div class="col-6 d-flex justify-content-center">Range</div>
                </div>
				<side-gantt-list></side-gantt-list>
            </div>
            <div id="ganttView" class="col-9 hide-scrll mh-100 overflow-auto p-0">
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
			alert("Failed to get data, please try again");
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
			projectPhaseRow.loadProjectData(this.projectData.phases);
		}
		const timeLine = document.querySelector("time-line") as TimeLine;
		if (timeLine) {
			timeLine.render(new Date());
		}

		console.log("Data:", this.projectData);

		const mainTitle = document.getElementById("mainTitle");
		if (mainTitle) mainTitle.textContent = this.projectData.summary;
	}
}

customElements.define("view-toggler", ViewToggler);

export default ViewToggler;
