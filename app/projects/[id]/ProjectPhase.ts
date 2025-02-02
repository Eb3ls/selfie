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
	private createStatusIcon(status: string): HTMLElement {
		const statusConfig = {
			WAITING: { color: CONST.waiting_color, text: "In attesa" },
			ACTIVABLE: { color: CONST.activable_color, text: "Attivabile" },
			ACTIVE: { color: CONST.active_color, text: "Attivo" },
			SUBMITTED: { color: CONST.submitted_color, text: "Consegnato" },
			COMPLETED: { color: CONST.completed_color, text: "Completato" },
			REACTIVATED: { color: CONST.reactivated_color, text: "Riattivato" },
			OVERDUE: { color: CONST.overdue_color, text: "Scaduto" },
			DROPPED: { color: CONST.dropped_color, text: "Abbandonato" }
		};

		const icon = document.createElement("i");
		icon.className = "bi bi-circle-fill fs-5 me-3";
		
		const currentStatus = statusConfig[status as keyof typeof statusConfig];
		if (currentStatus) {
			icon.style.color = currentStatus.color;
			icon.setAttribute("data-bs-toggle", "tooltip");
			icon.setAttribute("data-bs-placement", "top");
			icon.setAttribute("title", currentStatus.text);
		}

		return icon;
	}

	// Funzione per aggiungere i dati dell'attivitá al modale
	openModifyActivityModal(activity: any, phaseData: any) {
		console.log("Tentativo di apertura modale...");
		const modifyActivityModal = document.getElementById("ModifyActivityComponent") as any;

		if (!modifyActivityModal) {
			console.error("Errore: modale per modifica delle activity non trovato");
			return;
		}

		modifyActivityModal.setData(activity, phaseData);
		console.log("Apertura del modale per la modifica dell'attivitá");
	}

	// Funzione per creare una attivitá
	handleItem(activity: any, phaseData: any): HTMLElement {
		const activityElement = document.createElement("div");
		activityElement.className = "row p-3";
		activityElement.style.height = `${CONST.ROW_HEIGHT_PX}`;
		// Impostiamo data-bs-toggle e data-bs-target per il modale
		activityElement.setAttribute("data-bs-toggle", "modal");
		activityElement.setAttribute("data-bs-target", "#ModifyActivity");

		// Prima colonna con icona e testo
		const firstCol = document.createElement("div");
		firstCol.className = "col ms-5 d-flex align-items-center";
		
		const statusIcon = this.createStatusIcon(activity.status);
		const summaryText = document.createTextNode(activity.summary);
		
		firstCol.appendChild(statusIcon);
		firstCol.appendChild(summaryText);

		// Seconda colonna con le date
		const secondCol = document.createElement("div");
		secondCol.className = "col";
		secondCol.textContent = `${new Date(activity.dtStart).toLocaleDateString()} - ${new Date(activity.due).toLocaleDateString()}`;

		activityElement.appendChild(firstCol);
		activityElement.appendChild(secondCol);

		// Aggiungiamo il listener per aprire il modale
		activityElement.addEventListener("click", () => {
			this.openModifyActivityModal(activity, phaseData);
		});

		return activityElement;
	}

	renderPhase(data: any): HTMLElement {
		const container = document.createElement("div");

		// Creiamo il toggler per la fase
		const toggler = document.createElement("div");
		toggler.className = "row p-3";
		toggler.style.height = `${CONST.ROW_HEIGHT_PX}`;

		const togglerContent = document.createElement("div");
		togglerContent.className = "d-flex align-items-center";

		const caretIcon = document.createElement("i");
		caretIcon.className = "bi bi-caret-right-fill me-3 fs-5";
		caretIcon.style.cursor = "pointer";
		caretIcon.style.transition = "transform 0.2s";
		caretIcon.setAttribute("data-bs-toggle", "collapse");
		caretIcon.setAttribute("data-bs-target", `#collapse${data._id}`);
		caretIcon.onclick = () => {
			caretIcon.style.transform = caretIcon.style.transform === "rotate(90deg)" ? "rotate(0)" : "rotate(90deg)";
		};

		const button = document.createElement("button");
		button.className = "btn btn-primary rounded-3 px-4 py-2 flex-grow-1 text-start";
		button.textContent = data.summary;

		togglerContent.appendChild(caretIcon);
		togglerContent.appendChild(button);
		toggler.appendChild(togglerContent);
		container.appendChild(toggler);

		let noInsideData = true;

		// Creiamo il collapse per le sottofasi/attivitá
		const collapse = document.createElement("div");
		collapse.id = `collapse${data._id}`;
		collapse.className = "collapse ms-3";

		if (data.subPhases?.length > 0) {
			noInsideData = false;
			data.subPhases.forEach((subPhase: any) => {
				collapse.appendChild(this.renderPhase(subPhase));
			});
		}

		if (data.activities?.length > 0) {
			noInsideData = false;
			data.activities.forEach((activity: any) => {
				const dataForActivityModal = { ...data, activities: [] };
				const activityElement = this.handleItem(activity, dataForActivityModal);
				collapse.appendChild(activityElement);
			});
		}

		if (!noInsideData) {
			container.appendChild(collapse);
		} else {
			caretIcon.classList.add("invisible");
		}

		return container;
	}

	render(data: any) {
		const container = document.createElement("div");
		container.className = "container";

		// Per ogni fase, appendiamo il suo contenuto
		data.forEach((phase: any) => {
			container.appendChild(this.renderPhase(phase));
		});

		this.innerHTML = "";
		this.appendChild(container);
	}
 }

customElements.define("project-phase", ProjectPhase);

export default ProjectPhase;
