import { user, activity, activityData, formatDate } from "../Utils";

class ModifyActivity extends HTMLElement {
    phaseData: any;
    activityData: any;
    activitiesList: any;
    modifiedUserlist: user[];
    modifiedLinklist: activity[];

    constructor() {
        super();
        this.phaseData = [];
        this.activityData = [];
        this.activitiesList = [];
        this.modifiedUserlist = [];
        this.modifiedLinklist = [];
    }

    async handleSubmit(event: Event) {
        event.preventDefault();
        const form = event.target as HTMLFormElement;
        const formData = new FormData(form);

        const data: activityData = {
            _id: this.activityData._id,
            summary: formData.get('summary') as string,
            description: formData.get('description') as string,
            dtStart: new Date((formData.get('dtStart') as string) + 'T00:00:00.000Z').toISOString(),
            due: new Date((formData.get('due') as string) + 'T23:59:59.999Z').toISOString(),
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
                <button type="submit" class="btn btn-primary">Save Changes</button>
            </div>
        `;
    }

    // Aggiunge un utente alla lista
    private addItem(isUser: boolean, item: { name: string; id: string; }) {
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
    private setupItemManagement(isUserBtn: boolean) {

        if (isUserBtn) {
            const btn = this.querySelector('#addUserBtn');
            const newUser = this.querySelector('#newUser') as HTMLInputElement;

            for (const user of this.modifiedUserlist) {
                this.addItem(true, user);
            }
            
            // User management logic
            btn?.addEventListener('click', () => {
                const value = newUser.value;
                this.clearError(newUser);

                if (!this.validateUsername(value)) {
                    this.showError(newUser, 'Invalid username (3-20 characters, only letters, numbers, - and _)');
                    return;
                }

                const newItem = { name: value, id: value };
                this.modifiedUserlist.push(newItem);
                this.addItem(true, newItem);
                newUser.value = '';
            });
        } else {
            const btn = this.querySelector('#addLinkBtn');
            const newLink = this.querySelector('#newLink') as HTMLSelectElement;

            for (const link of this.modifiedLinklist) {
                this.addItem(false, link);
            }

            // Link management logic 
            btn?.addEventListener('click', () => {
                const selectedOption = newLink.options[newLink.selectedIndex];
                const value = selectedOption?.value;
                const name = selectedOption?.textContent;
                
                if (!value) return;

                const newItem = { name: name || value, id: value };
                this.modifiedLinklist.push(newItem);
                this.addItem(false, newItem);
                
                newLink.innerHTML = this.createLinkItems();
                newLink.selectedIndex = 0;
            });
        }
    }

    // Funzione per ottenere le attivitá disponibili per il linking
    // Supponiamo che la lista di activies é giá ordinata per data di fine
    private getAvailableActivities() {
        const availableActivities = [];

        const startDate = new Date(this.activityData.dtStart);
        for (const activity of this.activitiesList) {
            // Se siamo arrivati all'attivitá corrente, interrompiamo, quelle successive hanno una due data maggiore
            if (activity._id === this.activityData._id) {
                break;
            }

            // Se l'attivitá é giá collegata o é giá stata selezionata, la saltiamo
            if(this.activityData.prevLinks.includes(activity._id) || 
               this.modifiedLinklist.some(link => link.id === activity._id)) {
                continue;
            }

            const activityDue = new Date(formatDate(activity.due));
            if (activityDue >= startDate) {
                continue;
            }

            availableActivities.push(activity);
        }

        return availableActivities;
    }

    private createLinkItems() {
        const availableActivities = this.getAvailableActivities();
        const text = availableActivities.length > 0 ? 'Select an activity...' : 'No available activities';

        let block = `<option value="" disabled selected>${text}</option>`;
        for (const activity of availableActivities) {
            block += `
                <option value="${activity._id}">${activity.summary}</option>
            `;
        }
        return block;
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
                                ${this.createLinkItems()}
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
                <button type="submit" class="btn btn-primary">Save Links</button>
            </div>
        `;
    }

    // Funzione chiamata per fornire i dati generali, chimata da viewToggler
    public loadData(activitiesList: any) {
        this.activitiesList = activitiesList;
        console.log(this.activitiesList);
    }

    // Funzione da chiamare per popolare il form con i dati
    public updateData(activityData: any, phaseData: any) {
        this.activityData = activityData;
        this.phaseData = phaseData;
        this.modifiedUserlist = [...this.activityData.users];
        for (const link of this.activityData.prevLinks) {
            this.modifiedLinklist.push({ name: link.summary, id: link._id });
        }
        console.log(this.modifiedLinklist);
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
                            <h5>${new Date(formatDate(this.activityData.due)).toLocaleDateString()}</h5>
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
                        : '<p class="text-muted">No users assigned</p>'}
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            </div>
        `;
    }

    private updateModalContent(mode: "VIEW" | "EDIT" | "LINK" | "DELETE") {
        const modalContent = this.querySelector('.modal-content');
        if (!modalContent) return;

        if (mode === "DELETE") {
            const header = `
                <i class="bi bi-exclamation-triangle-fill"></i>
                <span>Delete Activity</span>
            `;
            modalContent.innerHTML = `
                <div class="modal-header">
                    <h5 class="modal-title text-danger d-flex align-items-center gap-2">
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
                <div class="modal-body">
                    <p class="fs-5">Are you sure you want to delete this activity?</p>
                    <p class="text-danger">This action cannot be undone!</p>
                    <div class="alert alert-warning">
                        <h6 class="alert-heading">
                            <i class="bi bi-info-circle me-2"></i>
                            Activity Details:
                        </h6>
                        <p class="mb-0">Title: ${this.activityData.summary}</p>
                        <p class="mb-0">Start Date: ${new Date(this.activityData.dtStart).toLocaleDateString()}</p>
                        <p class="mb-0">Due Date: ${new Date(formatDate(this.activityData.due)).toLocaleDateString()}</p>
                        ${this.activityData.isMilestone ? '<p class="mb-0 text-primary"><i class="bi bi-flag-fill"></i> Milestone</p>' : ''}
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-danger" id="confirmDeleteBtn">Delete Activity</button>
                </div>
            `;

            const toggleBtn = modalContent.querySelector('#toggleEditBtn');
            toggleBtn?.addEventListener('click', () => this.updateModalContent("VIEW"));

            const confirmBtn = modalContent.querySelector('#confirmDeleteBtn');
            confirmBtn?.addEventListener('click', async () => {
                try {
                    const response = await fetch(`/api/project/activity/delete`, {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            _id: this.activityData._id
                        })
                    });

                    if (response.ok) {
                        window.location.reload();
                    } else {
                        throw new Error('Failed to delete activity');
                    }
                } catch (error) {
                    console.error('Error deleting activity:', error);
                    alert('Failed to delete activity');
                }
            });

        } else if (mode === "EDIT") {
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
                <form id="modifyLinkForm">${this.createLinkTemplate()}</form>
            `;

            this.setupItemManagement(false);

            const toggleBtn = modalContent.querySelector('#toggleEditBtn');
            toggleBtn?.addEventListener('click', () => this.updateModalContent("VIEW"));

            const form = modalContent.querySelector('#modifyLinkForm');
            form?.addEventListener('submit', async (e: Event) => {
                e.preventDefault();
                const url = "/api/project/activity/link";

                for (const link of this.modifiedLinklist) {
                    const body = {
                        "prevId": link.id,
                        "nextId": this.activityData._id,
                    }

                    try {
                        const response = await fetch(url, {
                            method: 'PATCH',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(body)
                        });

                        if (!response.ok) {
                            throw new Error('Failed to link activity ' + link.name);
                        }

                    } catch (error) {
                        console.error('Error linking activities:', error);
                        alert('Failed to link activities');
                    }
                }

                window.location.reload();
            });


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
                        <button type="button" class="btn btn-sm btn-danger me-2" id="deleteBtn">
                            <i class="bi bi-trash"></i>
                            Delete
                        </button>
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

            const deleteBtn = modalContent.querySelector('#deleteBtn');
            deleteBtn?.addEventListener('click', () => this.updateModalContent("DELETE"));

            const linkBtn = modalContent.querySelector('#linkBtn');
            linkBtn?.addEventListener('click', () => this.updateModalContent("LINK"));

            const editBtn = modalContent.querySelector('#editBtn');
            editBtn?.addEventListener('click', () => this.updateModalContent("EDIT"));
        }
    }
}

customElements.define('modify-activity', ModifyActivity);

export default ModifyActivity;
