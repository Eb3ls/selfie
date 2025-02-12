import { formatDate } from "../Utils";

class PhaseForm extends HTMLElement {
    parentData: any;
    phaseData: any;
    minInner: string;
    maxInner: string;
    minOuter: string;
    maxOuter: string;
    isEditMode: boolean;

    constructor() {
        super();
        this.parentData = [];
        this.phaseData = [];
        this.minInner = '';
        this.maxInner = '';
        this.minOuter = '';
        this.maxOuter = '';
        this.isEditMode = false;
    }

    private createViewTemplate() {
        return `
            <div class="modal-body">
                <div class="mb-4">
                    <label class="form-label text-muted small">Title</label>
                    <h4>${this.phaseData.summary}</h4>
                </div>
                
                <div class="mb-4">
                    <div class="row">
                        <div class="col-md-6">
                            <label class="form-label text-muted small">Start Date</label>
                            <h5>${new Date(this.phaseData.dtStart).toLocaleDateString()}</h5>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label text-muted small">Due Date</label>
                            <h5>${new Date(formatDate(this.phaseData.due)).toLocaleDateString()}</h5>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            </div>
        `;
    }

    private createModalContent(mode: "VIEW" | "EDIT" | "DELETE") {
        if (mode === "DELETE") {
            return `
                <div class="modal-header">
                    <h5 class="modal-title text-danger">
                        <i class="bi bi-exclamation-triangle-fill me-2"></i>
                        Delete Phase
                    </h5>
                    <div class="ms-auto">
                        <button type="button" class="btn btn-sm btn-outline-primary me-2" id="toggleEditBtn">
                            <i class="bi bi-x"></i>
                            Cancel
                        </button>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                </div>
                <div class="modal-body">
                    <p class="fs-5">Are you sure you want to delete this phase?</p>
                    <p class="text-danger">This action cannot be undone! All activities and sub-phases will be deleted.</p>
                    <div class="alert alert-warning">
                        <h6 class="alert-heading">
                            <i class="bi bi-info-circle me-2"></i>
                            Phase Details:
                        </h6>
                        <p class="mb-0">Title: ${this.phaseData.summary}</p>
                        <p class="mb-0">Start Date: ${new Date(this.phaseData.dtStart).toLocaleDateString()}</p>
                        <p class="mb-0">Due Date: ${new Date(formatDate(this.phaseData.due)).toLocaleDateString()}</p>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-danger" id="confirmDeleteBtn">Delete Phase</button>
                </div>
            `;
        }
        if (mode === "EDIT") {
            return `
            <div class="modal-header d-flex align-items-center">
                <h5 class="modal-title d-flex align-items-center gap-2">
                <i class="bi bi-pencil-fill"></i>
                <span>Modify Phase</span>
                </h5>
                <div class="ms-auto">
                <button type="button" class="btn btn-sm btn-outline-primary me-2" id="toggleEditBtn">
                    <i class="bi bi-x"></i>
                    Cancel
                </button>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
            </div>
            <form id="modifyPhaseForm">${this.createFormTemplate()}</form>
            `;
        } else {
            return `
            <div class="modal-header d-flex align-items-center">
                <h5 class="modal-title d-flex align-items-center gap-2">
                <i class="bi bi-info-circle"></i>
                <span>Phase</span>
                </h5>
                <div class="ms-auto">
                <button type="button" class="btn btn-sm btn-danger me-2" id="deleteBtn">
                    <i class="bi bi-trash"></i>
                    Delete
                </button>
                <button type="button" class="btn btn-sm btn-warning me-2" id="toggleEditBtn">
                    <i class="bi bi-pencil"></i>
                    Modify
                </button>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
            </div>
            ${this.createViewTemplate()}
            `;
        }
    }

    private updateModalContent(mode: "VIEW" | "EDIT" | "DELETE") {
        const modalContent = this.querySelector('.modal-content');
        if (!modalContent) return;

        modalContent.innerHTML = this.createModalContent(mode);
        if(mode === "VIEW"){
            this.setupViewEventListeners();
        }
        else if (mode === "EDIT") {
            this.setupModifyEventListeners();
        }
        else if (mode === "DELETE") {
            this.setupDeleteEventListeners();
        }
    }

    private setupViewEventListeners() {
        const editBtn = this.querySelector('#toggleEditBtn');
        editBtn?.addEventListener('click', () => {
            this.updateModalContent("EDIT");
        });

        const deleteBtn = this.querySelector('#deleteBtn');
        deleteBtn?.addEventListener('click', () => {
            this.updateModalContent("DELETE");
        });
    }

    private setupModifyEventListeners() {
        const form = this.querySelector('#modifyPhaseForm');
        form?.addEventListener('submit', this.handleModifySubmit.bind(this));

        const cancelBtn = this.querySelector('#toggleEditBtn');
        cancelBtn?.addEventListener('click', () => {
            this.updateModalContent("VIEW");
        });
    }

    private setupDeleteEventListeners() {
        const cancelBtn = this.querySelector('#toggleEditBtn');
        cancelBtn?.addEventListener('click', () => {
            this.updateModalContent("VIEW");
        });

        const confirmBtn = this.querySelector('#confirmDeleteBtn');
        confirmBtn?.addEventListener('click', async () => {
            try {
                const response = await fetch(`/api/project/phase/delete`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        _id: this.phaseData._id
                    })
                });

                if (response.ok) {
                    window.location.reload();
                } else {
                    throw new Error('Failed to delete phase');
                }
            } catch (error) {
                console.error('Error deleting phase:', error);
                alert('Failed to delete phase');
            }
        });
    }

    async handleModifySubmit(event: Event) {
        event.preventDefault();
        const form = event.target as HTMLFormElement;
        const formData = new FormData(form);

        const data = {
            _id: this.phaseData._id,
            summary: formData.get('summary') as string,
            dtStart: new Date(formData.get('dtStart') as string + 'T00:00:00.000Z').toISOString(),
            due: new Date(formData.get('due') as string + 'T23:59:59.999Z').toISOString(),
        };

        try {
            const response = await fetch(`/api/project/phase/modify`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                window.location.reload();
            } else {
                throw new Error('Failed to update activity');
            }
        } catch (error) {
            console.error('Error updating activity:', error);
            alert('Failed to update activity');
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
        this.id = 'ModifyPhaseComponent';
    }

    private createFormTemplate() {
        return `
            <div class="modal-body">
                <div class="mb-4">
                    <label for="summary" class="form-label fw-bold">Title</label>
                    <input type="text" class="form-control" id="summary" name="summary" 
                           required value="${this.phaseData.summary}">
                </div>
                
                <div class="mb-4">
                    <div class="d-flex justify-content-between gap-3">
                        <div class="flex-grow-1">
                            <label for="dtStart" class="form-label fw-bold">Start Date</label>
                            ${this.minInner ? `
                            <div class="small text-muted mb-1">
                                <i class="bi bi-info-circle"></i>
                                Max: ${this.minInner}
                            </div>
                            ` : ''}
                            <input type="date" class="form-control ${this.minInner ? 'border-bottom border-danger border-bottom-2' : ''}" 
                                   id="dtStart" name="dtStart" 
                                   required value="${formatDate(this.phaseData.dtStart)}"
                                   min="${this.minOuter}" 
                                   max="${this.maxOuter}">
                        </div>
                        <div class="flex-grow-1">
                            <label for="due" class="form-label fw-bold">Due Date</label>
                            ${this.maxInner ? `
                            <div class="small text-muted mb-1">
                                <i class="bi bi-info-circle"></i>
                                Min: ${this.maxInner}
                            </div>
                            ` : ''}
                            <input type="date" class="form-control ${this.maxInner ? 'border-bottom border-danger border-bottom-2' : ''}" 
                                   id="due" name="due" 
                                   required value="${formatDate(this.phaseData.due)}"
                                   min="${this.minOuter}" 
                                   max="${this.maxOuter}">
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="submit" class="btn btn-primary">Save Changes</button>
            </div>
        `;
    }

    // Funzione per trovare gli estremi delle date
    private getInnerDataRange(){ 
        this.minInner = "";
        this.maxInner = "";
        this.minOuter = "";
        this.maxOuter = "";

        if(this.parentData){
            this.minOuter = formatDate(this.parentData.dtStart);
            
            this.maxOuter = formatDate(this.parentData.due);

        }

        const finder = (data: any[]) => {
            for (const child of data){
                if (child.dtStart < this.minInner){
                    this.minInner = child.dtStart;
                }
                if (child.due > this.maxInner){
                    this.maxInner = child.due;
                }
                if (child.activities){
                    finder(child.activities);
                }
            }
        }

        // Se ha sottofasi troviamo min/max tra le sottofasi e i figli di queste
        if (this.phaseData.subPhases?.length > 0){
            this.minInner = this.phaseData.subPhases[0].dtStart;
            this.maxInner = this.phaseData.subPhases[0].due;
            finder(this.phaseData.subPhases);
        }
        else if (this.phaseData.activities?.length > 0){
            this.minInner = this.phaseData.activities[0].dtStart;
            this.maxInner = this.phaseData.activities[0].due;
            finder(this.phaseData.activities);
        }

        // NB: Necessario formattarlo prima perché 23:59:59.999Z lo considera il giorno dopo
        if (this.minInner !== "") {
            this.minInner = new Date(formatDate(this.minInner)).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
            });
        }
        if (this.maxInner !== "") {
            this.maxInner = new Date(formatDate(this.maxInner)).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
            });
        }
    }

    // Funzione da chiamare per popolare il form con i dati
    public updateData(phaseData: any, parentData: any) {
        this.phaseData = phaseData;
        this.parentData = parentData;
        this.isEditMode = false;
        this.getInnerDataRange();
        this.updateModalContent("VIEW");
    }
}

customElements.define('phase-form', PhaseForm);

export default PhaseForm;
