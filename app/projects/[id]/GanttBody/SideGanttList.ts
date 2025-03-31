import {
	PhaseResponse,
	ProjectActivityResponse,
	SubPhaseResponse
} from "@/app/api/(auth)/project/[id]/route";
import { openActivityForm } from "../Forms/ActivityForm";
import { openPhaseForm } from "../Forms/PhaseForm";
import {
	PhaseToggleMap,
	ROW_HEIGHT_PX,
	User,
	createStatusIcon,
	formatDate,
	getToggleState,
	setToggleState
} from "../Utils";

class SideGanttList extends HTMLElement {
	openToggleList: PhaseToggleMap;
	currentUser: User | null;
	isOwner: boolean;

	constructor() {
		super();
		this.openToggleList = {};
		this.currentUser = null;
		this.isOwner = false;
	}

	public loadProjectData(
		phases: PhaseResponse[],
		openToggleList: PhaseToggleMap,
		currentUser: User,
		isOwner: boolean
	) {
		if (!phases) return;
		this.openToggleList = openToggleList;
		this.currentUser = currentUser;
		this.isOwner = isOwner;

		this.innerHTML = "";

		const container = document.createElement("div");
		container.className = "container";

		// Per ogni fase, appendiamo il suo contenuto
		phases.forEach((phase: any) => {
			container.appendChild(this.renderPhase(phase, null));
		});

		this.appendChild(container);
	}

	// Funzione per creare una attivitá
	handleItem(
		activity: ProjectActivityResponse,
		phaseData: PhaseResponse | SubPhaseResponse
	): HTMLElement {
		const activityElement = document.createElement("div");
		activityElement.className = "d-flex align-items-center ps-5 w-100";
		activityElement.style.height = `${ROW_HEIGHT_PX}`;

		// Icona
		const isCurrentUserInvolved = activity.users.some(
			(user: User) => user.id === this.currentUser?.id
		);
		const statusIcon = createStatusIcon(
			activity.status as any,
			activity._id,
			isCurrentUserInvolved,
			this.isOwner
		);

		statusIcon.style.width = "20px";
		statusIcon.style.flexShrink = "0";

		// Container per le due colonne con titolo e date
		const columnsContainer = document.createElement("div");
		columnsContainer.className = "d-flex ps-3 gap-3";
		columnsContainer.style.width = `calc(100% - 40px)`;

		// Prima colonna con il titolo
		const firstCol = document.createElement("div");
		firstCol.className = "d-flex flex-grow-1";
		// Flex applica min-width: auto
		firstCol.style.minWidth = "0";

		if (activity.isMilestone) {
			const flag = document.createElement("i");
			flag.className = "bi bi-flag-fill me-2";
			firstCol.appendChild(flag);
		}

		const text = document.createElement("span");
		text.className = "text-truncate";
		text.textContent = activity.summary;
		firstCol.appendChild(text);

		// Seconda colonna con le date
		const secondCol = document.createElement("div");
		secondCol.className =
			"flex-shrink-0 d-none d-lg-flex align-items-center justify-content-end";
		secondCol.textContent = `
			${new Date(formatDate(activity.dtStart)).getDate()} ${new Date(formatDate(activity.dtStart)).toLocaleString("default", { month: "short" })}
			-
			${new Date(formatDate(activity.due)).getDate()} ${new Date(formatDate(activity.due)).toLocaleString("default", { month: "short" })}
		`;

		if (activity.isOverdue) {
			secondCol.classList.add("text-danger");
		}

		columnsContainer.appendChild(firstCol);
		columnsContainer.appendChild(secondCol);
		// Impostiamo data-bs-toggle e data-bs-target per il modale
		columnsContainer.setAttribute("data-bs-toggle", "modal");
		columnsContainer.setAttribute("data-bs-target", "#ModifyActivity");

		activityElement.appendChild(statusIcon);
		activityElement.appendChild(columnsContainer);

		// Aggiungiamo il listener per aprire il modale
		activityElement.addEventListener("click", () => {
			openActivityForm(activity, phaseData);
		});

		return activityElement;
	}

	renderPhase(
		data: PhaseResponse | SubPhaseResponse,
		parentData: PhaseResponse | null
	): HTMLElement {
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
			"btn btn-primary text-truncate rounded-3 px-4 py-2 flex-grow-1 text-start";
		button.textContent = data.summary;
		// Impostiamo data-bs-toggle e data-bs-target per il modale
		button.setAttribute("data-bs-toggle", "modal");
		button.setAttribute("data-bs-target", "#ModifyPhase");
		button.onclick = () => {
			openPhaseForm(data, parentData);
		};

		togglerContent.appendChild(caretIcon);
		togglerContent.appendChild(button);
		toggler.appendChild(togglerContent);
		container.appendChild(toggler);

		let hasDataInside = false;

		// Creiamo il collapse per le sottofasi/attivitá
		const collapse = document.createElement("div");
		collapse.id = `collapse${data._id}`;
		collapse.className = "collapse ms-3";

		// Aggiungiamo l'evento per sbloccare il click
		collapse.addEventListener("shown.bs.collapse", () => {
			isAnimating = false;
			setToggleState(
				this.openToggleList,
				data._id,
				parentData?._id || null,
				true
			);
		});

		collapse.addEventListener("hidden.bs.collapse", () => {
			isAnimating = false;
			setToggleState(
				this.openToggleList,
				data._id,
				parentData?._id || null,
				false
			);
		});

		if ("subPhases" in data && data.subPhases.length > 0) {
			hasDataInside = true;
			data.subPhases.forEach((subPhase) => {
				collapse.appendChild(this.renderPhase(subPhase, data));
			});
		}

		if (data.activities?.length > 0) {
			hasDataInside = true;
			data.activities.forEach((activity: any) => {
				const activityElement = this.handleItem(activity, data);
				collapse.appendChild(activityElement);
			});
		}

		// Se non abbiamo dati nel collapse nascondiamo l'icona e non lo appendiamo
		if (hasDataInside) {
			container.appendChild(collapse);
			if (
				getToggleState(
					this.openToggleList,
					data._id,
					parentData?._id || null
				)
			) {
				collapse.classList.add("show");
				caretIcon.style.transform = "rotate(90deg)";
			}
		} else {
			caretIcon.classList.add("invisible");
		}

		return container;
	}
}

customElements.define("side-gantt-list", SideGanttList);

export default SideGanttList;
