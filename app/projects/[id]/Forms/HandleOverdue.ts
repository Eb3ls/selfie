import { ProjectActivityResponse, fetcher, overdueToHandle } from "../Utils";

class HandleOverdue extends HTMLElement {
	overdueActivities: overdueToHandle[];

	constructor() {
		super();
		this.overdueActivities = [];
	}

	connectedCallback() {
		this.innerHTML = `
            <button type="button" class="btn btn-warning position-relative d-flex align-items-center me-4" 
            data-bs-toggle="modal" data-bs-target="#handleOverdueModal" overdue activities need attention">
            <i class="bi bi-exclamation-triangle-fill"></i>
            <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" id="overdueCount">
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
	}

	loadProjectData(overdueActivities: overdueToHandle[]) {
		if (!overdueActivities) return;
		this.overdueActivities = overdueActivities;
		const overdueCount = document.getElementById("overdueCount");
		if (overdueCount)
			overdueCount.textContent = overdueActivities.length.toString();
		this.render();
	}

	renderBtn(color: string, icon: string, text: string): HTMLElement {
		const btn = document.createElement("button");
		btn.className = `btn btn-${color} btn-sm`;
		btn.style.minWidth = "150px";
		btn.innerHTML = `<i class="bi bi-${icon}"></i> ${text}`;
		return btn;
	}

	// Creiamo i bottoni base per ogni attività
	renderBaseButtons(id: string): HTMLElement {
		const buttonGroup = document.createElement("div");
		buttonGroup.id = "buttonGroup";
		buttonGroup.className = "btn-group ms-3";

		const translateBtn = this.renderBtn(
			"outline-primary",
			"arrow-right",
			"Trasla"
		);
		translateBtn.addEventListener("click", () => {
			this.renderConfirmButtons(id, true, buttonGroup);
		});
		const contractBtn = this.renderBtn(
			"outline-success",
			"arrows-collapse",
			"Contrai"
		);
		contractBtn.addEventListener("click", () => {
			this.renderConfirmButtons(id, false, buttonGroup);
		});

		buttonGroup.appendChild(translateBtn);
		buttonGroup.appendChild(contractBtn);
		return buttonGroup;
	}

	// Sostituiamo i bottoni base con i bottoni di conferma
	renderConfirmButtons(
		id: string,
		toShift: boolean,
		buttonGroup: HTMLElement
	): HTMLElement {
		buttonGroup.innerHTML = "";

		const cancelBtn = this.renderBtn("secondary", "x", "Annulla");
		cancelBtn.addEventListener("click", () => {
			const newButtonGroup = this.renderBaseButtons(id);
			buttonGroup.replaceWith(newButtonGroup);
		});

		const confirmBtn = this.renderBtn("primary", "check", "Conferma");
		confirmBtn.addEventListener("click", async () => {
			try {
				await fetcher("PATCH", "/api/project/activity/handleOverdue", {
					_id: id,
					shifting: toShift ? "TOSHIFT" : "FIXED"
				});
				window.location.reload();
			} catch (error) {
				alert("Errore durante la richiesta");
			}
		});

		buttonGroup.appendChild(cancelBtn);
		buttonGroup.appendChild(confirmBtn);
		return buttonGroup;
	}

	// Creiamo un elemento per ogni attività in ritardo
	createSingleElement(activity: overdueToHandle): HTMLElement {
		const element = document.createElement("div");
		element.className =
			"d-flex justify-content-between align-items-center p-2 rounded border mt-2";

		const summary = document.createElement("div");
		summary.className = "flex-grow-1";
		summary.textContent = activity.summary;

		const buttonGroup = this.renderBaseButtons(activity._id);

		element.appendChild(summary);
		element.appendChild(buttonGroup);

		return element;
	}

	render() {
		const modalBody = this.querySelector(".modal-body");
		if (!modalBody) return;
		for (const activity of this.overdueActivities) {
			modalBody.appendChild(this.createSingleElement(activity));
		}
	}
}

customElements.define("handle-overdue", HandleOverdue);

export default HandleOverdue;
