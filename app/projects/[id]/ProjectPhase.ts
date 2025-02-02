import * as CONST from "./constants";

class ProjectPhase extends HTMLElement {
	constructor() {
		super();
	}

	static get observedAttributes() {
		return ["data"];
	}

	// Funzione chiamata quando l'attributo "data" cambia
	attributeChangedCallback(name: string, _oldValue: any, newValue: any) {
		if (name === "data") {
			try {
				if(!newValue || newValue === "[]") {
					return;
				}
				const data = JSON.parse(newValue);
				this.render(data);
			} catch (error) {
				console.error("Errore nel parsing dei dati:", error);
			}
		}
	}

	// Funzione per ottenere l'icona dello stato
	getStatusIcon(status: string) {
		const icon = document.createElement("i");
		icon.className = "bi bi-circle-fill fs-5 me-3";
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
			<div class="col ms-5">
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
			<div class="d-flex align-items-center w-100">
				<i class="bi bi-caret-right-fill me-3 fs-5" 
					style="cursor: pointer; transition: transform 0.2s;"
					data-bs-toggle="collapse"
					data-bs-target="#collapse${data._id}"
					onclick="this.style.transform = this.style.transform === 'rotate(90deg)' ? 'rotate(0)' : 'rotate(90deg)';"
				></i>
				<button class="btn btn-primary rounded-3 px-4 py-2 flex-grow-1 text-start">
					${data.summary}
				</button>
			</div>
		`;

		// Contenitore per il collapse
		const collapse = document.createElement("div");
		collapse.id = `collapse${data._id}`;
		collapse.className = "collapse";

		let noInsideData = true

		// Gestione delle sottofasi
		if (data.subPhases && data.subPhases.length > 0) {
			noInsideData = false
			for (const subPhase of data.subPhases) {
				collapse.innerHTML += this.renderPhase(subPhase);
			}
		}

		//Gestione delle attività
		if (data.activities && data.activities.length > 0) {
			noInsideData = false
			for (const activity of data.activities) {
				const activityElement = this.handleItem(activity);
				collapse.appendChild(activityElement);
			}
		}

		// Se non ci sono dati togliamo il collapse mantenendo lo spazio per il bottone
		if (noInsideData) {
			toggler.innerHTML = `
			<div class="d-flex align-items-center w-100">
				<i class="bi bi-caret-right-fill me-3 fs-5 invisible"></i> 
				<div class="btn btn-primary rounded-3 px-4 py-2 flex-grow-1 text-start">
					${data.summary}
				</div>
			</div>
			`;
			return toggler.outerHTML;
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
