/* Passiamo una struttura dati cosí composta:
 * {
 *	id: UUID
 * 	summary: "Fase 1",
 * 	dtStart: "2021-01-01",
 * 	dtEnd: "2021-01-31",
 * 	subPhases: [
 * 	{
 * 		id: UUID,
 * 		summary: "Sottofase 1",
 * 		dtStart: "2021-01-01",
 * 		dtEnd: "2021-01-15",
 * 		activities: [
 * 			{
 * 			id: UUID,
 * 			summary: "Attivitá 1",
 * 			status: "In corso",
 * 			dtStart: "2021-01-01",
 * 			dtEnd: "2021-01-05",
 * 			}
 * 		]
 * 	}]
 * }
 * */
import * as CONST from "./constants";

class ProjectPhase extends HTMLElement {
	constructor() {
		super();
	}

	static get observedAttributes() {
		return ["data"];
	}

	attributeChangedCallback(name: string, oldValue: string, newValue: string) {
		if (name === "data") {
			try {
				const data = JSON.parse(newValue);
				this.render(data);
			} catch (error) {
				console.error("Errore nel parsing dei dati:", error);
			}
		}
	}

	getStatusIcon(status: string) {
		const icon = document.createElement("i");
		icon.className = "bi bi-circle-fill fs-5";
		switch (status) {
			case "WAITING":
				icon.style.color = CONST.waiting_color;
				break;
			case "ACTIVABLE":
				icon.style.color = CONST.activable_color;
				break;
			case "ACTIVE":
				icon.style.color = CONST.active_color;
				break;
			case "SUBMITTED":
				icon.style.color = CONST.submitted_color;
				break;
			case "COMPLETED":
				icon.style.color = CONST.completed_color;
				break;
			case "REACTIVATED":
				icon.style.color = CONST.reactivated_color;
				break;
			case "OVERDUE":
				icon.style.color = CONST.overdue_color;
				break;
			case "DROPPED":
				icon.style.color = CONST.dropped_color;
				break;
			default:
				console.error("Stato non riconosciuto:", status);
		}
		return icon.outerHTML;
	}

	handleItem(activity: any) {
		const activityElement = document.createElement("div");
		activityElement.className = "row p-3";
		activityElement.style.height = `${CONST.ROW_HEIGHT_PX}`;
		activityElement.innerHTML = `
			<div class="col">
				${this.getStatusIcon(activity.status)} ${activity.summary}
			</div>
			<div class="col">
				${new Date(activity.dtStart).toLocaleDateString()} - ${new Date(activity.due).toLocaleDateString()}
			</div>`;
		return activityElement;
	}

	renderPhase(data: any) {
		// Creiamo il toggler per la fase
		const toggler = document.createElement("div");
		toggler.className = "row p-3";
		toggler.style.height = `${CONST.ROW_HEIGHT_PX}`;
		toggler.innerHTML = `
        <button class="btn btn-primary"
          	type="button"
          	data-bs-toggle="collapse"
          	data-bs-target="#collapse${data._id}" 
          	aria-expanded="false"
          	aria-controls="collapse">
          	${data.summary}
        </button>
      	`;

		// Contenitore per il collapse
		const collapse = document.createElement("div");
		collapse.id = `collapse${data._id}`;
		collapse.className = "collapse";

		// Gestione delle sottofasi
		if (data.subPhases && data.subPhases.length > 0) {
			for (const subPhase of data.subPhases) {
				collapse.innerHTML += this.renderPhase(subPhase);
			}
		}

		//Gestione delle attività
		if (data.activities && data.activities.length > 0) {
			for (const activity of data.activities) {
				const activityElement = this.handleItem(activity);
				collapse.appendChild(activityElement);
			}
		}

		return toggler.outerHTML + collapse.outerHTML;
	}

	render(data: any) {
		const container = document.createElement("div");
		container.className = "container";

		for (const phase of data) {
			const phaseElement = document.createElement("div");
			phaseElement.className = "row";
			phaseElement.innerHTML = this.renderPhase(phase);
			container.appendChild(phaseElement);
		}

		this.innerHTML = "";
		this.appendChild(container);
	}
 }

customElements.define("project-phase", ProjectPhase);

export default ProjectPhase;
