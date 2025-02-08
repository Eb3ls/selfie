import { Time } from "rrule/dist/esm/datetime";
import { ROW_HEIGHT_PX } from "./Utils";
import TimeList from "./listBody/TimeList";
import ProjectSettings from "./Forms/ProjectSettings";
import AddForm from "./Forms/AddForm";
import SideGanttList from "./GanttBody/SideGanttList";
import ProjectPhaseRow from "./GanttBody/ProjectPhaseRow";
import TimeLine from "./GanttBody/TimeLine";

class ViewToggler extends HTMLElement{
    isGanttView: "GANTT" | "LIST";
    data: any; 

    constructor(){
        super();
        // Inizializziamo la vista sbagliata per forzare il render
        this.isGanttView = "LIST";
        this.data = null;
    }

    async connectedCallback(){
        this.data = await this.getData();
        this.render("GANTT");
    }

    render(viewMode: "GANTT" | "LIST"){

        if (this.isGanttView === viewMode) return;
        this.isGanttView = viewMode;

        if(viewMode === "GANTT"){
            this.innerHTML = `
                ${this.getHeaderTemplate("GANTT")}
                ${this.getGanntBody()}
            `;
            this.addEventListeners();
            this.loadData();
        }else{
            this.innerHTML = `
                ${this.getHeaderTemplate("LIST")}
                ${this.getListBody("TIME")}
            `
            this.addEventListeners();
        }
    }

    getHeaderTemplate(type: "GANTT" | "LIST") {
        let block;
        if (type === "GANTT"){
            block = `
                <div class="col-9 d-flex flex-column align-items-center">
                    <div class="fs-4" id="yearDiv"></div>
                    <div class="fs-5" id="monthDiv"></div>
                </div>
            `;
        } else{
            block = `
                <div class="col-9 d-flex justify-content-end">
                    <button class="btn" id="userSort">Attore</button>
                    <button class="btn" id="timeSort">Temporalmente</button>
                </div>
            `;
        }
            
        return`
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

    getListBody(type: "USER" | "TIME") {
        const listBlock = document.createElement("time-list") as TimeList;
        listBlock.loadData(this.data.phases);
        return listBlock.innerHTML;
    }

    addEventListeners() {
        const ganttBtn = this.querySelector("#renderGantt") as HTMLButtonElement;
        const listBtn = this.querySelector("#renderList") as HTMLButtonElement;

        ganttBtn.addEventListener("click", () => {
            this.render("GANTT");
        });

        listBtn.addEventListener("click", () => {
            this.render("LIST");
        });
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

    loadData() {
        if (!this.data) return;

        const projectSettings = document.querySelector("project-settings") as ProjectSettings
        const addFormComponent = document.querySelector("add-form-component") as AddForm;
        const sideGanttList = document.querySelector("side-gantt-list") as SideGanttList;
        const projectPhaseRow = document.querySelector("project-phase-row") as ProjectPhaseRow;
        const timeLine = document.querySelector("time-line") as TimeLine;

        if (projectSettings && typeof projectSettings.loadProjectData === 'function') {
            projectSettings.loadProjectData(this.data.summary, this.data._id, this.data.users);
        }
        if (addFormComponent && typeof addFormComponent.loadProjectData === 'function') {
            addFormComponent.loadProjectData(this.data._id, this.data.phases);
        }
        if (sideGanttList && typeof sideGanttList.loadProjectData === 'function') {
            sideGanttList.loadProjectData(this.data.phases);
        }
        if (projectPhaseRow && typeof projectPhaseRow.loadProjectData === 'function') {
            projectPhaseRow.loadProjectData(this.data.phases);
        }
        if (timeLine && typeof timeLine.render === 'function') {
            timeLine.render(new Date());
        }

        console.log("Data:", this.data);

        const mainTitle = document.getElementById("mainTitle");
        if (mainTitle) mainTitle.textContent = this.data.summary;
    }
}

customElements.define('view-toggler', ViewToggler);

export default ViewToggler;