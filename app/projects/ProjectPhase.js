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
		let icon = "CIAO";
		switch (status) {
			case "WAITING":
				icon = `<i class="bi bi-circle-fill fs-5 text-warning"></i>`;
				break;
			case "IN_PROGRESS":
				icon = `<i class="bi bi-circle-fill fs-5 text-success"></i>`;
				break;
			case "COMPLETED":
				icon = `<i class="bi bi-circle-fill fs-5 text-info"></i>`;
				break;
			default:
				icon = `<i class="bi bi-circle-fill fs-5 text-secondary"></i>`;
		}
		return icon;
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
