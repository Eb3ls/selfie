import { act } from "react";

// Formatta la data ISO per l'input date
function formatDate(date: string): string {
    return date.split('T')[0];
}
interface ActivityData {
    _id: string;
    summary: string;
    description: string;
    dtStart: string;
    due: string;
    isMilestone: boolean;
    usernameList: string[];
}

interface user{
    name: string;
    id: string;
}

interface activity{
    name: string;
    id: string;
}

class ModifyActivity extends HTMLElement {
    phaseData: any;
    activityData: any;
    modifiedUserlist: user[];
    modifiedLinklist: activity[];

    constructor() {
        super();
        this.phaseData = [];
        this.activityData = [];
        this.modifiedUserlist = [];
        this.modifiedLinklist = [];
    }

    async handleSubmit(event: Event) {
        event.preventDefault();
        const form = event.target as HTMLFormElement;
        const formData = new FormData(form);

        const data: ActivityData= {
            _id: this.activityData._id,
            summary: formData.get('summary') as string,
            description: formData.get('description') as string,
            dtStart: new Date(formData.get('dtStart') as string + 'T00:00:00.000Z').toISOString(),
            due: new Date(formData.get('due') as string + 'T23:59:59.999Z').toISOString(),
            isMilestone: formData.get('isMilestone') === 'on',
            usernameList: [] // TODO: Implementare gestione utenti
        };

        try {
            const response = await fetch(`/api/project/activity/modify`, {
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
            <div class="modal fade" id="ModifyActivity" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                    </div>
                </div>
            </div>
        `;
        this.id = 'ModifyActivityComponent';
    }

    private validateUsername(username: string): boolean {
        const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
        return usernameRegex.test(username);
    }

    private showError(inputElement: HTMLElement, message: string) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'invalid-feedback d-block';
        errorDiv.textContent = message;
        inputElement.classList.add('is-invalid');
        inputElement.parentElement?.appendChild(errorDiv);
    }

    private clearError(inputElement: HTMLElement) {
        inputElement.classList.remove('is-invalid');
        const errorDiv = inputElement.parentElement?.querySelector('.invalid-feedback');
        if (errorDiv) errorDiv.remove();
    }

    private createFormTemplate() {
        return `
            <div class="modal-body">
                <div class="mb-4">
                    <label for="summary" class="form-label fw-bold">Title</label>
                    <input type="text" class="form-control" id="summary" name="summary" 
                           required value="${this.activityData.summary}">
                </div>
                
                <div class="mb-4">
                    <label for="description" class="form-label fw-bold">Description</label>
                    <textarea class="form-control" id="description" name="description" 
                          rows="3">${this.activityData.description || ''}</textarea>
                </div>

                <div class="mb-4 d-flex justify-content-between gap-3">
                    <div class="flex-grow-1">
                        <label for="dtStart" class="form-label fw-bold">Start Date</label>
                        <input type="date" class="form-control" id="dtStart" name="dtStart" 
                           required value="${formatDate(this.activityData.dtStart)}"
                           min="${formatDate(this.phaseData.dtStart)}" 
                           max="${formatDate(this.phaseData.due)}">
                    </div>
                    <div class="flex-grow-1">
                        <label for="due" class="form-label fw-bold">Due Date</label>
                        <input type="date" class="form-control" id="due" name="due" 
                           required value="${formatDate(this.activityData.due)}"
                           min="${formatDate(this.phaseData.dtStart)}" 
                           max="${formatDate(this.phaseData.due)}">
                    </div>
                </div>

                <div class="mb-4 form-check">
                    <input type="checkbox" class="form-check-input" id="isMilestone" 
                           name="isMilestone" ${this.activityData.isMilestone ? 'checked' : ''}>
                    <label class="form-check-label" for="isMilestone">Is Milestone</label>
                </div>

                <div class="mb-4">
                    <label class="form-label fw-bold">Assigned Users</label>
                    <div class="add-user-form">
                        <div class="input-group">
                            <input type="text" class="form-control" id="newUser" 
                                   placeholder="Add new user">
                            <button class="btn btn-primary" type="button" id="addUserBtn">
                                <i class="bi bi-plus-lg"></i> Add
                            </button>
                        </div>
                    </div>
                    <div class="user-list mt-2" id="userList">
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                <button type="submit" class="btn btn-primary">Save Changes</button>
            </div>
        `;
    }

    // Aggiunge un utente alla lista
    private addItem(isUser: boolean, item: {name: string, id: string}) {
        const itemName = isUser ? 'user' : 'link';
        const list = this.querySelector(`#${itemName}List`);
        if (!list) return;

        const itemBlock = document.createElement('div');
        itemBlock.className = 'user-item d-flex justify-content-between align-items-center bg-light';
        itemBlock.setAttribute(`data-${itemName}`, item.id);
        
        itemBlock.innerHTML = `
            <span class="${itemName}-name">
                <i class="bi bi-${itemName === "user" ? "person-fill" : "link-45deg"} me-2"></i>
                ${item.name}
            </span>
            <button type="button" class="btn btn-danger btn-sm">
                <i class="bi bi-trash"></i>
            </button>
        `;

        itemBlock.querySelector('button')?.addEventListener('click', () => {
            if (isUser) {
                this.modifiedUserlist = this.modifiedUserlist.filter(user => user.id !== item.id);
            } else {
                this.modifiedLinklist = this.modifiedLinklist.filter(link => link.id !== item.id);
            }
            itemBlock.remove();
        });

        list.appendChild(itemBlock);
    }

    // Funzione per l'aggiunta e l'eliminazione degli utenti
    private setupItemManagement(isEdit: boolean) {
        const type = isEdit ? 'User' : 'Link';
        const btn = this.querySelector(` #add${type}Btn`);
        const newInput = this.querySelector(`#new${type}`) as HTMLInputElement;

        if(isEdit){
            for (const user of this.modifiedUserlist) {
                this.addItem(true, user);
            }
        }
        else{
            for (const link of this.modifiedLinklist) {
                this.addItem(false, link);
            }

        }

        btn?.addEventListener('click', () => {
            let value = "";

            if(isEdit){
                value = newInput.value.trim();
            }
            else{
                value = newInput.value;
            }
            
            if (!value) {
                return;
            }

            if(isEdit){
                this.clearError(newInput);

                if (!this.validateUsername(value)) {
                    this.showError(newInput, 'Invalid username (3-20 characters, only letters, numbers, - and _)');
                    return;
                }
            }

            const newItem = {name: value, id: value};

            if (isEdit){
                // Aggiungiamo l'utente alla lista TODO - Implementare gestione utenti
                this.modifiedUserlist.push(newItem);
                this.addItem(true, newItem);
            }
            else{
                this.modifiedLinklist.push(newItem);
                this.addItem(false, newItem);
            }

            newInput.value = '';
        });
    }

    private createLinkTemplate() {
        return `
            <div class="modal-body">
                <div class="mb-4">
                    <h4 class="mb-3">${this.activityData.summary}</h4>
                    <label class="form-label fw-bold">Link with other Activities</label>
                    <div class="add-link-form">
                        <div class="input-group mb-3">
                            <select class="form-select" id="newLink">
                                <option value="" disabled selected>Select an activity...</option>
                                <option value="1">Activity 1</option>
                                <option value="2">Activity 2</option>
                                <option value="3">Activity 3</option>
                            </select>
                            <button class="btn btn-primary" type="button" id="addLinkBtn">
                                <i class="bi bi-plus-lg"></i> Add
                            </button>
                        </div>
                    </div>
                    <div class="link-list mt-2" id="linkList">
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            </div>
        `;
    }

    // Funzione da chiamare per popolare il form con i dati
    public setData(activityData: any, phaseData: any) {
        this.activityData = activityData;
        this.phaseData = phaseData;
        this.modifiedUserlist = [...this.activityData.users];
        this.modifiedLinklist = this.activityData.links || [];
        this.updateModalContent("VIEW");
    }

    private createViewTemplate() {
        return `
            <div class="modal-body">
                <div class="mb-4">
                    <label class="form-label text-muted small">Title</label>
                    <h4>${this.activityData.summary}</h4>
                </div>
                
                <div class="mb-4">
                    <label class="form-label text-muted small">Description</label>
                    <p class="fs-5">${this.activityData.description || 'No description provided.'}</p>
                </div>

                <div class="mb-4">
                    <div class="row">
                        <div class="col-md-6">
                            <label class="form-label text-muted small">Start Date</label>
                            <h5>${new Date(this.activityData.dtStart).toLocaleDateString()}</h5>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label text-muted small">Due Date</label>
                            <h5>${new Date(this.activityData.due).toLocaleDateString()}</h5>
                        </div>
                    </div>
                </div>

                ${this.activityData.isMilestone ? `
                <div class="mb-4">
                    <span class="badge bg-primary">
                        <i class="bi bi-flag-fill me-1"></i>
                        Milestone
                    </span>
                </div>
                ` : ''}

                <div class="mb-4">
                    <label class="form-label text-muted small">Assigned Users</label>
                    <div class="user-list">
                        ${this.activityData.users?.length > 0 
                            ? this.activityData.users.map((user: user) => `
                                <div class="user-item d-flex align-items-center mb-2">
                                    <i class="bi bi-person-fill me-2"></i>
                                    ${user.name}
                                </div>
                            `).join('')
                            : '<p class="text-muted">No users assigned</p>'
                        }
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            </div>
        `;
    }

    private updateModalContent(mode: "VIEW" | "EDIT" | "LINK") {
        const modalContent = this.querySelector('.modal-content');
        if (!modalContent) return;

        if (mode === "EDIT") {
            const header = `
                <i class="bi bi-pencil-fill"></i>
                <span>Modify Activity</span>
            `;
            modalContent.innerHTML = `
                <div class="modal-header d-flex align-items-center">
                    <h5 class="modal-title d-flex align-items-center gap-2">
                        ${header}
                    </h5>
                    <div class="ms-auto">
                        <button type="button" class="btn btn-sm btn-warning me-2" id="toggleEditBtn">
                            <i class="bi bi-x"></i>
                            Cancel
                        </button>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                </div>
                <form id="modifyActivityForm">${this.createFormTemplate()}</form>
            `;

            const form = modalContent.querySelector('#modifyActivityForm');
            form?.addEventListener('submit', (e) => this.handleSubmit(e));
            this.setupItemManagement(true);

            const toggleBtn = modalContent.querySelector('#toggleEditBtn');
            toggleBtn?.addEventListener('click', () => this.updateModalContent("VIEW"));

        } else if (mode === "LINK") {
            const header = `
                <i class="bi bi-link"></i>
                <span>Link Activities</span>
            `;
            modalContent.innerHTML = `
                <div class="modal-header">
                    <h5 class="modal-title">
                        ${header}
                    </h5>
                    <div class="ms-auto">
                        <button type="button" class="btn btn-sm btn-warning me-2" id="toggleEditBtn">
                            <i class="bi bi-x"></i>
                            Cancel
                        </button>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                </div>
                <form id="modifyActivityForm">${this.createLinkTemplate()}</form>
            `;

            const form = modalContent.querySelector('#modifyActivityForm');
            form?.addEventListener('submit', (e) => this.handleSubmit(e));
            this.setupItemManagement(false);

            const toggleBtn = modalContent.querySelector('#toggleEditBtn');
            toggleBtn?.addEventListener('click', () => this.updateModalContent("VIEW"));

        } else {
            const header = `
                <i class="bi bi-info-circle"></i>
                <span>Activity</span>
            `;
            // Modalitá view
            modalContent.innerHTML = `
                <div class="modal-header d-flex align-items-center">
                    <h5 class="modal-title d-flex align-items-center gap-2">
                        ${header}
                    </h5>
                    <div class="ms-auto">
                        <button type="button" class="btn btn-sm btn-outline-primary me-2" id="linkBtn">
                            <i class="bi bi-link"></i>
                            Links
                        </button>
                        <button type="button" class="btn btn-sm btn-outline-primary me-2" id="editBtn">
                            <i class="bi bi-pencil"></i>
                            Modify
                        </button>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                </div>
                ${this.createViewTemplate()}
            `;

            const linkBtn = modalContent.querySelector('#linkBtn');
            linkBtn?.addEventListener('click', () => this.updateModalContent("LINK"));

            const editBtn = modalContent.querySelector('#editBtn');
            editBtn?.addEventListener('click', () => this.updateModalContent("EDIT"));
        }
    }
}

customElements.define('modify-activity', ModifyActivity);

export { ModifyActivity };

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
        if (modalContent) {
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

export { ModifyPhase };
