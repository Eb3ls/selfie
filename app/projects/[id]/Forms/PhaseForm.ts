import {
	PhaseResponse,
	SubPhaseResponse
} from "@/app/api/(auth)/project/[id]/route";
import {
	clearError,
	escapeHTML,
	fetcher,
	formatDate,
	formatStartDate,
	hideModal,
	showError,
	validateLength
} from "../Utils";
import ViewToggler from "../ViewToggler";

class PhaseForm extends HTMLElement {
	parentData: any;
	phaseData: any;
	minInner: string;
	maxInner: string;
	minOuter: string;
	maxOuter: string;
	isEditMode: boolean;
	isOwner: boolean;

	constructor() {
		super();
		this.parentData = [];
		this.phaseData = [];
		this.minInner = "";
		this.maxInner = "";
		this.minOuter = "";
		this.maxOuter = "";
		this.isEditMode = false;
		this.isOwner = false;
	}

	private createViewTemplate() {
		return `
			<div class="modal-body">
				<div class="mb-4">
					<label class="form-label text-muted small">Titolo</label>
					<h4 class="text-break">${escapeHTML(this.phaseData.summary)}</h4>
				</div>
				
				<div class="mb-4">
					<div class="row">
						<div class="col-md-6">
							<label class="form-label text-muted small">Data d'inizio</label>
							<h5>${new Date(this.phaseData.dtStart).toLocaleDateString()}</h5>
						</div>
						<div class="col-md-6">
							<label class="form-label text-muted small">Data di fine</label>
							<h5>${new Date(formatDate(this.phaseData.due)).toLocaleDateString()}</h5>
						</div>
					</div>
				</div>
			</div>
			<div class="modal-footer">
				<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Chiudi</button>
			</div>
		`;
	}

	private createModalContent(mode: "VIEW" | "EDIT" | "DELETE") {
		if (mode === "DELETE") {
			return `
                <div class="modal-header">
                    <h5 class="modal-title text-danger">
                        <i class="bi bi-exclamation-triangle-fill me-2"></i>
						Elimina Fase
                    </h5>
                    <div class="ms-auto d-flex align-items-center">
                        <button type="button" class="btn btn-sm btn-warning me-2" id="toggleEditBtn">
                            <i class="bi bi-x"></i>
                            Annulla
                        </button>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                </div>
                <div class="modal-body">
                    <p class="fs-5">Sei sicuro di voler eliminare la Fase?</p>
                    <p class="text-danger">Questa operazione non puó essere annullata! Tutte le attività e le sottofasi verranno cancellate! </p>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-danger" id="confirmDeleteBtn">Elimina Fase</button>
                </div>
            `;
		}
		if (mode === "EDIT") {
			return `
            <div class="modal-header">
                <h5 class="modal-title">
                <i class="bi bi-pencil-fill"></i>
                <span>Modifica Fase</span>
                </h5>
                <div class="ms-auto d-flex align-items-center">
                <button type="button" class="btn btn-sm btn-warning me-2" id="toggleEditBtn">
                    <i class="bi bi-x"></i>
                    Annulla
                </button>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
            </div>
            <form id="modifyPhaseForm">${this.createFormTemplate()}</form>
            `;
		} else {
			return `
			<div class="modal-header">
				<h5 class="modal-title">
					<i class="bi bi-info-circle"></i>
					<span>Fase</span>
				</h5>
				<div class="ms-auto d-flex align-items-center">
					${
						this.isOwner
							? `
					<button type="button" class="btn btn-sm btn-danger me-2" id="deleteBtn">
						<i class="bi bi-trash"></i>
						Elimina
					</button>
					<button type="button" class="btn btn-sm btn-primary me-2" id="toggleEditBtn">
						<i class="bi bi-pencil"></i>
						Modifica
					</button>`
							: ""
					}
					<button type="button" class="btn-close" data-bs-dismiss="modal"></button>
				</div>
			</div>
			${this.createViewTemplate()}
			`;
		}
	}

	private updateModalContent(mode: "VIEW" | "EDIT" | "DELETE") {
		const modalContent = this.querySelector(".modal-content");
		if (!modalContent) return;

		modalContent.innerHTML = this.createModalContent(mode);
		if (mode === "VIEW") {
			this.setupViewEventListeners();
		} else if (mode === "EDIT") {
			this.setupModifyEventListeners();
		} else if (mode === "DELETE") {
			this.setupDeleteEventListeners();
		}
	}

	private setupViewEventListeners() {
		const editBtn = this.querySelector("#toggleEditBtn");
		editBtn?.addEventListener("click", () => {
			this.updateModalContent("EDIT");
		});

		const deleteBtn = this.querySelector("#deleteBtn");
		deleteBtn?.addEventListener("click", () => {
			this.updateModalContent("DELETE");
		});
	}

	private setupModifyEventListeners() {
		const form = this.querySelector("#modifyPhaseForm");
		form?.addEventListener("submit", this.handleModifySubmit.bind(this));

		const cancelBtn = this.querySelector("#toggleEditBtn");
		cancelBtn?.addEventListener("click", () => {
			this.updateModalContent("VIEW");
		});
	}

	private setupDeleteEventListeners() {
		const cancelBtn = this.querySelector("#toggleEditBtn");
		cancelBtn?.addEventListener("click", () => {
			this.updateModalContent("VIEW");
		});

		const confirmBtn = this.querySelector("#confirmDeleteBtn");
		confirmBtn?.addEventListener(
			"click",
			this.handleDeleteSubmit.bind(this)
		);
	}

	async handleDeleteSubmit(event: Event) {
		event.preventDefault();

		const method = "DELETE";
		const url = `/api/project/phase/delete`;
		const body = {
			_id: this.phaseData._id
		};

		try {
			await fetcher(method, url, body);

			const viewToggler = document.querySelector(
				"view-toggler"
			) as ViewToggler | null;
			if (viewToggler) {
				await viewToggler.updatePage();
				const modal = document.querySelector(
					"#ModifyPhase"
				) as HTMLElement;
				hideModal(modal);
			} else {
				window.location.reload();
			}
		} catch (error) {
			alert("Errore nell'eliminazione della fase");
		}
	}

	async handleModifySubmit(event: Event) {
		event.preventDefault();
		const form = event.target as HTMLFormElement;
		const formData = new FormData(form);

		const summary = formData.get("summary") as string;
		const summaryBlock = this.querySelector("#summary") as HTMLInputElement;

		clearError(summaryBlock);

		if (!validateLength(summary, 3, 50)) {
			showError(
				summaryBlock,
				"Il titolo deve essere lungo tra 3 e 50 caratteri"
			);
			return;
		}

		const method = "PATCH";
		const url = `/api/project/phase/modify`;
		const body = {
			_id: this.phaseData._id,
			summary: summary,
			dtStart: formatStartDate(formData.get("dtStart") as string),
			due: formatStartDate(formData.get("due") as string)
		};

		try {
			await fetcher(method, url, body);

			const viewToggler = document.querySelector(
				"view-toggler"
			) as ViewToggler | null;
			if (viewToggler) {
				await viewToggler.updatePage();
			} else {
				window.location.reload();
			}
		} catch (error) {
			alert("Errore nell'aggiornamento della fase");
		}
	}

	// Renderizziamo il componente senza contenuto
	connectedCallback() {
		this.innerHTML = `
            <div class="modal fade" id="ModifyPhase" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                    </div>
                </div>
            </div>
        `;
		this.id = "ModifyPhaseComponent";
	}

	private createFormTemplate() {
		return `
            <div class="modal-body">
                <div class="mb-4">
                    <label for="summary" class="form-label fw-bold">Titolo</label>
                    <input type="text" class="form-control" id="summary" name="summary" required value="${this.phaseData.summary}">
                </div>
                
                <div class="mb-4">
                    <div class="d-flex justify-content-between gap-3">
                        <div class="flex-grow-1">
                            <label for="dtStart" class="form-label fw-bold">Data d'inizio</label>
                            <input type="date" class="form-control" id="dtStart" name="dtStart" required value="${formatDate(this.phaseData.dtStart)}"
								min="${this.minOuter}" 
								max="${this.minInner}">
                        </div>
                        <div class="flex-grow-1">
                            <label for="due" class="form-label fw-bold">Data di fine</label>
                            <input type="date" class="form-control" id="due" name="due" required value="${formatDate(this.phaseData.due)}"
								min="${this.maxInner}" 
								max="${this.maxOuter}">
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="submit" class="btn btn-primary">Salva</button>
            </div>
        `;
	}

	// Funzione per trovare gli estremi delle date
	private getInnerDataRange() {
		this.minInner = "";
		this.maxInner = "";
		this.minOuter = "";
		this.maxOuter = "";

		if (this.parentData) {
			this.minOuter = formatDate(this.parentData.dtStart);

			this.maxOuter = formatDate(this.parentData.due);
		}

		const finder = (data: any[]) => {
			for (const child of data) {
				if (child.dtStart < this.minInner) {
					this.minInner = child.dtStart;
				}
				if (child.due > this.maxInner) {
					this.maxInner = child.due;
				}
				if (child.activities) {
					finder(child.activities);
				}
			}
		};

		// Se ha sottofasi troviamo min/max tra le sottofasi e i figli di queste
		if (this.phaseData.subPhases?.length > 0) {
			this.minInner = this.phaseData.subPhases[0].dtStart;
			this.maxInner = this.phaseData.subPhases[0].due;
			finder(this.phaseData.subPhases);
		} else if (this.phaseData.activities?.length > 0) {
			this.minInner = this.phaseData.activities[0].dtStart;
			this.maxInner = this.phaseData.activities[0].due;
			finder(this.phaseData.activities);
		}

		// NB: Necessario formattarlo prima perché 23:59:59.999Z lo considera il giorno dopo
		if (this.minInner !== "") {
			this.minInner = formatDate(this.minInner);
		}
		if (this.maxInner !== "") {
			this.maxInner = formatDate(this.maxInner);
		}
	}

	// Funzione da chiamare per popolare il form con i dati
	public updateData(
		phaseData: PhaseResponse | SubPhaseResponse,
		parentData: PhaseResponse | null
	) {
		this.phaseData = phaseData;
		this.parentData = parentData;
		this.isEditMode = false;
		this.getInnerDataRange();
		this.updateModalContent("VIEW");
	}
}

customElements.define("phase-form", PhaseForm);

export default PhaseForm;
