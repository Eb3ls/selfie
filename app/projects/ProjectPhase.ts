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
import * as CONSTANT from "./constants";

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
				icon.style.color = CONSTANT.waiting_color;
				break;
			case "ACTIVABLE":
				icon.style.color = CONSTANT.activable_color;
				break;
			case "ACTIVE":
				icon.style.color = CONSTANT.active_color;
				break;
			case "SUBMITTED":
				icon.style.color = CONSTANT.submitted_color;
				break;
			case "COMPLETED":
				icon.style.color = CONSTANT.completed_color;
				break;
			case "REACTIVATED":
				icon.style.color = CONSTANT.reactivated_color;
				break;
			case "OVERDUE":
				icon.style.color = CONSTANT.overdue_color;
				break;
			case "DROPPED":
				icon.style.color = CONSTANT.dropped_color;
				break;
			default:
				console.error("Stato non riconosciuto:", status);
		}
		return icon.outerHTML;
	}

	handleItem(activity: any) {
		const activityElement = document.createElement("div");
		activityElement.className = "row p-3";
		activityElement.style.height = `${CONSTANT.ROW_HEIGHT}`;
		activityElement.innerHTML = `
			<div class="col">
				${this.getStatusIcon(activity.status)} ${activity.summary}
			</div>
			<div class="col">
				${new Date(activity.dtStart).toLocaleDateString()} - ${new Date(activity.dtEnd).toLocaleDateString()}
			</div>`;
		return activityElement;
	}

	render(data: any) {
		// Impostiamo l'altezza dell'header con Titolo e Range
		const header = document.getElementById("header");
		if (header) {
			header.style.height = `${CONSTANT.ROW_HEIGHT}`;
		}
		// Creiamo il toggler per la fase
		const toggler = document.createElement("div");
		toggler.className = "row p-3";
		toggler.style.height = `${CONSTANT.ROW_HEIGHT}`;
		toggler.innerHTML = `
        <button class="btn btn-primary"
          	type="button"
          	data-bs-toggle="collapse"
          	data-bs-target="#collapse${data.id}" 
          	aria-expanded="false"
          	aria-controls="collapse">
          	${data.summary}
        </button>
      	`;

		// Contenitore per il collapse
		const collapse = document.createElement("div");
		collapse.id = `collapse${data.id}`;
		collapse.className = "collapse";

		// Gestione delle sottofasi
		if (data.subPhases) {
			for (const subPhase of data.subPhases) {
				const subPhaseElement = document.createElement("project-phase");
				subPhaseElement.setAttribute("data", JSON.stringify(subPhase));
				collapse.appendChild(subPhaseElement);
			}
		}

		//Gestione delle attività
		if (data.activities) {
			for (const activity of data.activities) {
				const activityElement = this.handleItem(activity);
				collapse.appendChild(activityElement);
			}
		}

		this.innerHTML = toggler.outerHTML + collapse.outerHTML;
	}
}

customElements.define("project-phase", ProjectPhase);

export default ProjectPhase;
