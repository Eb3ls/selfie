import { ProjectActivityResponse } from "@/app/api/(auth)/project/[id]/route";
import ModifyActivity from "../Forms/ActivityForm";
import { SortedActivity, User, createStatusIcon, formatDate } from "../Utils";

class TimeList extends HTMLElement {
	sortedActivities: SortedActivity[];
	currentUser: User | null;
	isOwner: boolean;

	constructor() {
		super();
		this.sortedActivities = [];
		this.currentUser = null;
		this.isOwner = false;
	}

	loadProjectData(
		sortedActivities: SortedActivity[],
		currentUser: User,
		isOwner: boolean
	) {
		if (!sortedActivities) return;
		this.currentUser = currentUser;
		this.isOwner = isOwner;

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
		summaryCol.className = "col-4 fw-bold text-truncate";
		summaryCol.textContent = act.summary;
		if (act.isMilestone) {
			const flag = document.createElement("i");
			flag.className = "bi bi-flag-fill ms-2";
			summaryCol.appendChild(flag);
		}

		const startCol = document.createElement("div");
		startCol.className = "col-4 text-center";
		startCol.textContent = `${start}`;

		const dueCol = document.createElement("div");
		dueCol.className = "col-4 text-center";
		dueCol.textContent = `${end}`;
		if (act.isOverdue) {
			startCol.classList.add("text-danger");
			dueCol.classList.add("text-danger");
		}

		clickableArea.appendChild(summaryCol);
		clickableArea.appendChild(startCol);
		clickableArea.appendChild(dueCol);

		const statusCol = document.createElement("div");
		statusCol.className =
			"col-3 d-flex align-items-center justify-content-center";

		// Creiamo il blocco per lo status
		const hasPermission = act.users.some(
			(user: User) => user.id === this.currentUser?.id
		);
		const statusBlock = createStatusIcon(
			act.status as any,
			act._id,
			hasPermission,
			this.isOwner
		);

		const statusText = document.createElement("div");
		statusText.className = "ms-2";
		statusText.textContent = act.status;
		statusCol.appendChild(statusBlock);
		statusCol.appendChild(statusText);

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
		startHeader.className = "ps-0 col-3 fw-bold text-center";
		startHeader.textContent = "Start Date";
		header.appendChild(startHeader);

		const dueHeader = document.createElement("div");
		dueHeader.className = "ps-0 col-3 fw-bold text-center";
		dueHeader.textContent = "Due Date";
		header.appendChild(dueHeader);

		const statusHeader = document.createElement("div");
		statusHeader.className = "col-3 fw-bold text-center";
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
