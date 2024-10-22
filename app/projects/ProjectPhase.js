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

const waiting_color = "#6c757d";
const activable_color = "#ffc107";
const active_color = "#007bff";
const submitted_color = "#28a745";
const completed_color = "#17a2b8";
const reactivated_color = "#6610f2";
const overdue_color = "#dc3545";
const dropped_color = "#343a40";

class ProjectPhase extends HTMLElement {
	constructor() {
		super();
	}

	static get observedAttributes() {
		return ["data"];
	}

	attributeChangedCallback(name, oldValue, newValue) {
		if (name === "data") {
			try {
				const data = JSON.parse(newValue);
				this.render(data);
			} catch (error) {
				console.error("Errore nel parsing dei dati:", error);
			}
		}
	}

	getStatusIcon(status) {
		const icon = document.createElement("i");
		icon.className = "bi bi-circle-fill fs-5";
		switch (status) {
			case "WAITING":
				icon.style.color = waiting_color;
				break;
			case "ACTIVABLE":
				icon.style.color = activable_color;
				break;
			case "ACTIVE":
				icon.style.color = active_color;
				break;
			case "SUBMITTED":
				icon.style.color = submitted_color;
				break;
			case "COMPLETED":
				icon.style.color = completed_color;
				break;
			case "REACTIVATED":
				icon.style.color = reactivated_color;
				break;
			case "OVERDUE":
				icon.style.color = overdue_color;
				break;
			case "DROPPED":
				icon.style.color = dropped_color;
				break;
			default:
				console.error("Stato non riconosciuto:", status);
		}
		return icon.outerHTML;
	}

	handleItem(activity) {
		const activityElement = document.createElement("div");
		activityElement.className = "row p-3";
		activityElement.innerHTML = `
			<div class="col">
				${this.getStatusIcon(activity.status)} ${activity.summary}
			</div>
			<div class="col">
				${new Date(activity.dtStart).toLocaleDateString()} - ${new Date(activity.dtEnd).toLocaleDateString()}
			</div>`;
		return activityElement;
	}

	render(data) {
		// Creiamo il toggler per la fase
		const toggler = `
	    <div class="row p-3">
        	<button class="btn btn-primary"
          	type="button"
          	data-bs-toggle="collapse"
          	data-bs-target="#collapse${data.id}" 
          	aria-expanded="false"
          	aria-controls="collapse">
          	${data.summary}
        	</button>
      	</div>`;

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

		this.innerHTML = `${toggler} ${collapse.outerHTML}`;
	}
}

customElements.define("project-phase", ProjectPhase);

export default ProjectPhase;
