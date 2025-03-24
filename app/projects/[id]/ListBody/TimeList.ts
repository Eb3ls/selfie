import ModifyActivity from "../Forms/ActivityForm";
import {
	PhaseResponse,
	ProjectActivityResponse,
	SortedActivity,
	SubPhaseResponse,
	createStatusIcon,
	formatDate
} from "../Utils";

class TimeList extends HTMLElement {
	sortedActivities: SortedActivity[];

	constructor() {
		super();
		this.sortedActivities = [];
	}

	loadProjectData(sortedActivities: SortedActivity[]) {
		if (!sortedActivities) return;

		// Se siamo nella view a lista per utente passiamo direttamente le activities
		this.sortedActivities = sortedActivities;
		this.render();
	}

	// Funzione per aggiungere i dati al modale
	openModify(activity: SortedActivity) {
		const modifyModal = document.getElementById(
			`ModifyActivityComponent`
		) as ModifyActivity;

		if (!modifyModal) {
			console.error(
				`Errore: modale per modifica delle activity non trovato`
			);
			return;
		}

		const activityData = activity as ProjectActivityResponse;
		const parentPhase = activity.parentPhase;
		modifyModal.updateData(activityData, parentPhase);
	}

	createItem(act: SortedActivity) {
		const block = document.createElement("div");
		block.className =
			"row rounded p-2 mt-3 border-bottom border-secondary list-item";

		const clickableArea = document.createElement("div");
		clickableArea.className = "col-9 d-flex";
		clickableArea.addEventListener("click", () => {
			this.openModify(act);
		});
		clickableArea.setAttribute("data-bs-toggle", "modal");
		clickableArea.setAttribute("data-bs-target", "#ModifyActivity");

		const start = new Date(formatDate(act.dtStart)).toLocaleDateString();
		const end = new Date(formatDate(act.due)).toLocaleDateString();

		const summaryCol = document.createElement("div");
		summaryCol.className = "col-4 fw-bold";
		summaryCol.textContent = act.summary;

		const startCol = document.createElement("div");
		startCol.className = "col-4 text-muted";
		startCol.textContent = `${start}`;

		const dueCol = document.createElement("div");
		dueCol.className = "col-4 text-muted";
		dueCol.textContent = `${end}`;

		clickableArea.appendChild(summaryCol);
		clickableArea.appendChild(startCol);
		clickableArea.appendChild(dueCol);

		const statusCol = document.createElement("div");
		statusCol.className = "col-3";

		// Creiamo il blocco per lo status
		const statusBlock = createStatusIcon(act.status as any, act._id);
		statusCol.appendChild(statusBlock);
		statusCol.appendChild(document.createTextNode(act.status));

		block.appendChild(clickableArea);
		block.appendChild(statusCol);

		return block;
	}

	render() {
		this.innerHTML = "";
		this.className = "px-3";
		const innerBlock = document.createElement("div");
		innerBlock.className = "container-fluid mt-3 px-4";
		this.appendChild(innerBlock);

		const header = document.createElement("div");
		header.className = "row p-2 border-bottom border-secondary rounded";
		innerBlock.appendChild(header);

		const summaryHeader = document.createElement("div");
		summaryHeader.className = "col-3 fw-bold";
		summaryHeader.textContent = "Titolo";
		header.appendChild(summaryHeader);

		const startHeader = document.createElement("div");
		startHeader.className = "col-3 fw-bold";
		startHeader.textContent = "Start Date";
		header.appendChild(startHeader);

		const dueHeader = document.createElement("div");
		dueHeader.className = "col-3 fw-bold";
		dueHeader.textContent = "Due Date";
		header.appendChild(dueHeader);

		const statusHeader = document.createElement("div");
		statusHeader.className = "col-3 fw-bold";
		statusHeader.textContent = "Status";
		header.appendChild(statusHeader);

		for (const num in this.sortedActivities) {
			const activity = this.sortedActivities[num];
			innerBlock.appendChild(this.createItem(activity));
		}
	}
}

customElements.define("time-list", TimeList);

export default TimeList;
