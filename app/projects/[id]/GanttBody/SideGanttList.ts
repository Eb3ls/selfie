import ModifyActivity from "../Forms/ActivityForm";
import ModifyPhase from "../Forms/PhaseForm";
import {
	PhaseResponse,
	ROW_HEIGHT_PX,
	createStatusIcon,
	formatDate
} from "../Utils";

class SideGanttList extends HTMLElement {
	constructor() {
		super();
	}

	public loadProjectData(phases: PhaseResponse[]) {
		if (!phases) return;
		const container = document.createElement("div");
		container.className = "container";

		// Per ogni fase, appendiamo il suo contenuto
		phases.forEach((phase: any) => {
			container.appendChild(this.renderPhase(phase, null));
		});

		this.innerHTML = "";
		this.appendChild(container);
	}

	// Funzione per aggiungere i dati al modale
	openModify(data: any, parentData: any, isPhase: boolean) {
		const name = isPhase ? "Phase" : "Activity";
		const modifyModal = document.getElementById(
			`Modify${name}Component`
		) as ModifyPhase | ModifyActivity;

		if (!modifyModal) {
			console.error(
				`Errore: modale per modifica delle ${name.toLocaleLowerCase()} non trovato`
			);
			return;
		}

		modifyModal.updateData(data, parentData);
	}

	// Funzione per creare una attivitá
	handleItem(activity: any, phaseData: any): HTMLElement {
		const activityElement = document.createElement("div");
		activityElement.className = "d-flex align-items-center ms-5";
		activityElement.style.height = `${ROW_HEIGHT_PX}`;

		// Icona
		const statusIcon = createStatusIcon(activity.status, activity._id);

		// Container per le due colonne con titolo e date
		const columnsContainer = document.createElement("div");
		columnsContainer.className =
			"d-flex flex-grow-1 justify-content-between";

		// Prima colonna con il titolo
		const firstCol = document.createElement("div");
		firstCol.className = "col d-flex align-items-center";
		const summaryText = document.createTextNode(activity.summary);
		firstCol.appendChild(summaryText);
		if (activity.isMilestone) {
			const flag = document.createElement("i");
			flag.className = "bi bi-flag-fill ms-2";
			firstCol.appendChild(flag);
		}

		// Seconda colonna con le date
		const secondCol = document.createElement("div");
		secondCol.className = "col";
		secondCol.textContent = `
			${new Date(formatDate(activity.dtStart)).toLocaleDateString()}
			-
			${new Date(formatDate(activity.due)).toLocaleDateString()}
		`;

		columnsContainer.appendChild(firstCol);
		columnsContainer.appendChild(secondCol);
		// Impostiamo data-bs-toggle e data-bs-target per il modale
		columnsContainer.setAttribute("data-bs-toggle", "modal");
		columnsContainer.setAttribute("data-bs-target", "#ModifyActivity");

		activityElement.appendChild(statusIcon);
		activityElement.appendChild(columnsContainer);

		// Aggiungiamo il listener per aprire il modale
		activityElement.addEventListener("click", () => {
			this.openModify(activity, phaseData, false);
		});

		return activityElement;
	}

	renderPhase(data: any, parentData: any): HTMLElement {
		const container = document.createElement("div");

		// Creiamo il toggler per la fase
		const toggler = document.createElement("div");
		toggler.className = "row p-3";
		toggler.style.height = `${ROW_HEIGHT_PX}`;

		const togglerContent = document.createElement("div");
		togglerContent.className = "d-flex align-items-center";

		let isAnimating = false; // Variabile per bloccare i click durante l'animazione

		const caretIcon = document.createElement("i");
		caretIcon.className = "bi bi-caret-right-fill me-3 fs-5";
		caretIcon.style.transition = "transform 0.2s";
		caretIcon.setAttribute("data-bs-toggle", "collapse");
		caretIcon.setAttribute("data-bs-target", `#collapse${data._id}`);
		caretIcon.onclick = () => {
			// Se l'animazione é in corso non facciamo nulla
			if (isAnimating) return;
			isAnimating = true;
			let animation;
			if (caretIcon.style.transform === "rotate(90deg)") {
				animation = "rotate(0)";
			} else {
				animation = "rotate(90deg)";
			}
			caretIcon.style.transform = animation;
		};

		const button = document.createElement("button");
		button.className =
			"btn btn-primary rounded-3 px-4 py-2 flex-grow-1 text-start";
		button.textContent = data.summary;
		// Impostiamo data-bs-toggle e data-bs-target per il modale
		button.setAttribute("data-bs-toggle", "modal");
		button.setAttribute("data-bs-target", "#ModifyPhase");
		button.onclick = () => {
			this.openModify(data, parentData, true);
		};

		togglerContent.appendChild(caretIcon);
		togglerContent.appendChild(button);
		toggler.appendChild(togglerContent);
		container.appendChild(toggler);

		let noInsideData = true;

		// Creiamo il collapse per le sottofasi/attivitá
		const collapse = document.createElement("div");
		collapse.id = `collapse${data._id}`;
		collapse.className = "collapse ms-3";
		// Aggiungiamo l'evento per sbloccare il click
		collapse.addEventListener("shown.bs.collapse", (e) => {
			isAnimating = false;
		});
		collapse.addEventListener("hidden.bs.collapse", (e) => {
			isAnimating = false;
		});

		if (data.subPhases?.length > 0) {
			noInsideData = false;
			const dataForModify = { ...data, subPhases: [] };
			data.subPhases.forEach((subPhase: any) => {
				collapse.appendChild(this.renderPhase(subPhase, dataForModify));
			});
		}

		if (data.activities?.length > 0) {
			noInsideData = false;
			data.activities.forEach((activity: any) => {
				const dataForModify = { ...data, activities: [] };
				const activityElement = this.handleItem(
					activity,
					dataForModify
				);
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
}

customElements.define("side-gantt-list", SideGanttList);

export default SideGanttList;
