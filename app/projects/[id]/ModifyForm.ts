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

class ModifyActivity extends HTMLElement {
    phaseData: any;
    activityData: any;

    constructor() {
        super();
        this.phaseData = [];
        this.activityData = [];
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
    private addUser(username: { name: string; id: string }) {
        const userList = this.querySelector('#userList');
        if (!userList) return;

        const userItem = document.createElement('div');
        userItem.className = 'user-item d-flex justify-content-between align-items-center bg-light';
        userItem.setAttribute('data-user', username.id);
        
        userItem.innerHTML = `
            <span class="user-name">
                <i class="bi bi-person-fill me-2"></i>
                ${username.name}
            </span>
            <button type="button" class="btn btn-danger btn-sm">
                <i class="bi bi-trash"></i>
            </button>
        `;

        userItem.querySelector('button')?.addEventListener('click', () => {
            userItem.remove();
        });

        userList.appendChild(userItem);
    }

    // Funzione per l'aggiunta e l'eliminazione degli utenti
    private setupUserManagement() {
        const addUserBtn = this.querySelector('#addUserBtn');
        const newUserInput = this.querySelector('#newUser') as HTMLInputElement;

        for (const user of this.activityData.users) {
            this.addUser(user);
        }

        addUserBtn?.addEventListener('click', () => {
            const username = newUserInput.value.trim();
            
            if (!username) {
                return;
            }

            this.clearError(newUserInput);

            if (!this.validateUsername(username)) {
                this.showError(newUserInput, 'Invalid username (3-20 characters, only letters, numbers, - and _)');
                return;
            }

            // Aggiungiamo l'utente alla lista TODO - Implementare gestione utenti
            const user = { name: username, id: username };
            this.activityData.users.push(user);
            this.addUser(user);
            newUserInput.value = '';
        });

    }

    // Funzione da chiamare per popolare il form con i dati
    public setData(activityData: any, phaseData: any) {
        this.activityData = activityData;
        // Necessario per la validazione delle date
        this.phaseData = phaseData;
        
        const modalContent = this.querySelector('.modal-content');
        if (modalContent) {
            modalContent.innerHTML = `
                <div class="modal-header">
                    <h5 class="modal-title">
                        <i class="bi bi-pencil-fill me-2"></i>
                        Modify Activity
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <form id="modifyActivityForm">
                    ${this.createFormTemplate()}
                </form>
            `;

            const form = modalContent.querySelector('#modifyActivityForm');
            form?.addEventListener('submit', (e) => this.handleSubmit(e));
            
            this.setupUserManagement();
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

    constructor() {
        super();
        this.parentData = [];
        this.phaseData = [];
        this.minInner = '';
        this.maxInner = '';
        this.minOuter = '';
        this.maxOuter = '';
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
        console.log(this.phaseData, this.parentData);

        this.getInnerDataRange();
        console.log(this.phaseData, this.parentData);
        console.log(this.minInner, this.maxInner);
        console.log(this.minOuter, this.maxOuter);
        
        const modalContent = this.querySelector('.modal-content');
        if (modalContent) {
            modalContent.innerHTML = `
                <div class="modal-header">
                    <h5 class="modal-title">
                        <i class="bi bi-pencil-fill me-2"></i>
                        Modify Phase
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <form id="modifyPhaseForm">
                    ${this.createFormTemplate()}
                </form>
            `;

            const form = modalContent.querySelector('#modifyPhaseForm');
            form?.addEventListener('submit', (e) => this.handleSubmit(e));
        }
    }
}

customElements.define('modify-phase', ModifyPhase);

export { ModifyPhase };
