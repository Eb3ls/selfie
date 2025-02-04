
import { formatDate } from "../Utils";

class ModifyPhase extends HTMLElement {
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

    private toggleEditMode() {
        this.isEditMode = !this.isEditMode;
        this.updateModalContent();
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
                            <h5>${new Date(this.phaseData.due).toLocaleDateString()}</h5>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            </div>
        `;
    }

    private updateModalContent() {
        const modalContent = this.querySelector('.modal-content');

        if (!modalContent) return;

        modalContent.innerHTML = `
            <div class="modal-header d-flex align-items-center">
                <h5 class="modal-title d-flex align-items-center gap-2">
                    <i class="bi bi-${this.isEditMode ? 'pencil-fill' : 'info-circle'}"></i>
                    <span>${this.isEditMode ? 'Modify' : ''} Phase</span>
                </h5>
                <div class="ms-auto">
                    <button type="button" class="btn btn-sm ${this.isEditMode ? 'btn-warning' : 'btn-light'} me-2" id="toggleEditBtn">
                        <i class="bi bi-${this.isEditMode ? 'x' : 'pencil'}"></i>
                        ${this.isEditMode ? 'Cancel' : 'Modify'}
                    </button>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                </div>
            </div>
            ${this.isEditMode 
                ? `<form id="modifyPhaseForm">${this.createFormTemplate()}</form>` 
                : this.createViewTemplate()
            }
        `;

        if (this.isEditMode) {
            const form = modalContent.querySelector('#modifyPhaseForm');
            form?.addEventListener('submit', (e) => this.handleSubmit(e));
        }

        const toggleBtn = modalContent.querySelector('#toggleEditBtn');
        toggleBtn?.addEventListener('click', () => this.toggleEditMode());
    }

    async handleSubmit(event: Event) {
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
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
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

        if (this.minInner !== "") {
            this.minInner = new Date(this.minInner).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
            });
        }
        if (this.maxInner !== "") {
            this.maxInner = new Date(this.maxInner).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
            });
        }
    }

    // Funzione da chiamare per popolare il form con i dati
    public setData(phaseData: any, parentData: any) {
        this.phaseData = phaseData;
        this.parentData = parentData;
        this.isEditMode = false;
        this.getInnerDataRange();
        this.updateModalContent();
    }
}

customElements.define('modify-phase', ModifyPhase);

export default ModifyPhase;
