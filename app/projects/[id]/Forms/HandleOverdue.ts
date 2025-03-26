import { ProjectActivityResponse } from "../Utils";

class HandleOverdue extends HTMLElement {
	overdueActivities: ProjectActivityResponse[];

	constructor() {
		super();
		this.overdueActivities = [];
	}

	connectedCallback() {
		const badgeCount = this.overdueActivities.length + 100;
		this.innerHTML = `
            <button type="button" 
            class="btn btn-warning position-relative d-flex align-items-center me-4" 
            data-bs-toggle="modal" 
            data-bs-target="#handleOverdueModal"
            title="${badgeCount} overdue activities need attention">
            <i class="bi bi-exclamation-triangle-fill"></i>
            <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                ${badgeCount}
                <span class="visually-hidden">overdue items</span>
            </span>
            </button>

            <div class="modal fade" id="handleOverdueModal" tabindex="-1" aria-labelledby="handleOverdueModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title text-danger">
                                <i class="bi bi-exclamation-triangle-fill"></i>
                                <span>Gestisci attività in ritardo</span>
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body p-4" style="max-height: 80vh; overflow-y: auto;">
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Chiudi</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
		this.render();
	}

	loadProjectData(overdueActivities: ProjectActivityResponse[]) {
		if (!overdueActivities) return;
		this.overdueActivities = overdueActivities;
		this.render();
	}

	renderTraslaBtn(): HTMLElement {
		const translateBtn = document.createElement("button");
		translateBtn.className = "btn btn-outline-primary btn-sm";
		translateBtn.style.minWidth = "150px";
		translateBtn.innerHTML = '<i class="bi bi-arrow-right"></i> Trasla';
		return translateBtn;
	}

	renderContraiBtn(): HTMLElement {
		const contractBtn = document.createElement("button");
		contractBtn.className = "btn btn-outline-success btn-sm";
		contractBtn.style.minWidth = "150px";
		contractBtn.innerHTML = '<i class="bi bi-arrows-collapse"></i> Contrai';
		return contractBtn;
	}

	createSingleElement(activity: ProjectActivityResponse): HTMLElement {
		const element = document.createElement("div");
		element.className =
			"d-flex justify-content-between align-items-center p-2 rounded border mt-2";

		const summary = document.createElement("div");
		summary.className = "flex-grow-1";
		summary.textContent = activity.summary;

		const buttonGroup = document.createElement("div");
		buttonGroup.className = "btn-group ms-3";

		const translateBtn = this.renderTraslaBtn();
		const contractBtn = this.renderContraiBtn();

		const resetButtons = () => {
			translateBtn.innerHTML = '<i class="bi bi-arrow-right"></i> Trasla';
			translateBtn.className = "btn btn-outline-primary btn-sm";
			contractBtn.innerHTML =
				'<i class="bi bi-arrows-collapse"></i> Contrai';
			contractBtn.className = "btn btn-outline-success btn-sm";
		};

		const setConfirmState = () => {
			translateBtn.innerHTML = '<i class="bi bi-x"></i> Annulla';
			translateBtn.className = "btn btn-secondary btn-sm";
			contractBtn.innerHTML = '<i class="bi bi-check"></i> Conferma';
			contractBtn.className = "btn btn-primary btn-sm";
		};

		const createCancelHandler = (
			oldTranslateClick: any,
			oldContractClick: any
		) => {
			return () => {
				resetButtons();
				translateBtn.onclick = oldTranslateClick;
				contractBtn.onclick = oldContractClick;
			};
		};

		const translateToConfirm = () => {
			const oldTranslateClick = translateBtn.onclick;
			const oldContractClick = contractBtn.onclick;

			setConfirmState();
			translateBtn.onclick = createCancelHandler(
				oldTranslateClick,
				oldContractClick
			);
			contractBtn.onclick = () =>
				alert(`Selezionato ${activity.summary} per traslare`);
		};

		const contractToConfirm = () => {
			const oldTranslateClick = translateBtn.onclick;
			const oldContractClick = contractBtn.onclick;

			setConfirmState();
			translateBtn.onclick = createCancelHandler(
				oldTranslateClick,
				oldContractClick
			);
			contractBtn.onclick = () =>
				alert(`Selezionato ${activity.summary} per contrarre`);
		};

		translateBtn.onclick = translateToConfirm;
		contractBtn.onclick = contractToConfirm;

		buttonGroup.appendChild(translateBtn);
		buttonGroup.appendChild(contractBtn);
		element.appendChild(summary);
		element.appendChild(buttonGroup);

		return element;
	}

	createRandomActivities(count: number): ProjectActivityResponse[] {
		const activities: ProjectActivityResponse[] = [];
		for (let i = 0; i < count; i++) {
			activities.push({
				_id: i.toString(),
				summary: `Activity ${i}`,
				description: `Description for activity ${i}`,
				status: "overdue",
				dtStart: new Date().toISOString(),
				due: new Date().toISOString(),
				isMilestone: false,
				owner: { id: "1", name: "Default User" },
				users: [],
				prevLinks: [],
				prevMaxDue: new Date().toISOString(),
				nextLinks: [],
				nextMinStart: new Date().toISOString(),
				alarms: []
			});
		}
		return activities;
	}

	render() {
		const modalBody = this.querySelector(".modal-body");
		if (!modalBody) return;
		modalBody.innerHTML = "";
		this.overdueActivities = this.createRandomActivities(3);
		for (const activity of this.overdueActivities) {
			modalBody.appendChild(this.createSingleElement(activity));
		}
	}
}

customElements.define("handle-overdue", HandleOverdue);

export default HandleOverdue;
