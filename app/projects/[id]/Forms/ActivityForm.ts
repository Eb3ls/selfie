import {fetcher, formatDate, PhaseResponse, ProjectActivityResponse, User} from "../Utils";

interface PartialLink {
    name: string;
    _id: string;
}

class ActivityForm extends HTMLElement {
    phaseData: PhaseResponse;
    activityData: ProjectActivityResponse;
    activitiesList: ProjectActivityResponse[];
    usersAvaiable: string[];
    usersList: string[];
    modifiedLinklist: PartialLink[];

    constructor() {
        super();
        this.phaseData = {} as PhaseResponse;
        this.activityData = {} as ProjectActivityResponse;
        this.activitiesList = [];
        this.usersAvaiable = [];
        this.usersList = [];
        this.modifiedLinklist = [];
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

    // Funzione chiamata per fornire i dati generali, chimata da viewToggler
    public loadData(activitiesList: ProjectActivityResponse[], usersAvaiable: string[]) {
        this.activitiesList = [...activitiesList];
        this.usersAvaiable = [...usersAvaiable];
    }

    // Funzione per fornire i dati dell'activity specifica
    public updateData(activityData: ProjectActivityResponse, phaseData: PhaseResponse) {
        this.activityData = activityData;
        this.phaseData = phaseData;
        this.usersList = activityData.users?.map(user => user.name) || [];
        for (const link of this.activityData.prevLinks) {
            this.modifiedLinklist.push({ name: link.summary, _id: link._id });
        }
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
                        ? this.activityData.users.map((user: User) => `
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

        modalContent.innerHTML = "";
        if (mode === "DELETE") {
            const body = new ActivityDeleteForm();
            body.initialize(this.activityData);
            modalContent.appendChild(body);

            const toggleBtn = modalContent.querySelector('#toggleEditBtn');
            toggleBtn?.addEventListener('click', () => this.updateModalContent("VIEW"));
        } else if (mode === "EDIT") {
            const body = new ActivityModifyForm();
            body.initialize(this.activityData, this.phaseData, this.usersList, this.usersAvaiable);
            modalContent.appendChild(body);

            const toggleBtn = modalContent.querySelector('#toggleEditBtn');
            toggleBtn?.addEventListener('click', () => this.updateModalContent("VIEW"));

        } else if (mode === "LINK") {
            const body = new ActivityLinkForm();
            body.initialize(this.activityData, this.activitiesList, this.modifiedLinklist);
            modalContent.appendChild(body);

            const toggleBtn = modalContent.querySelector('#toggleEditBtn');
            toggleBtn?.addEventListener('click', () => this.updateModalContent("VIEW"));
        } else {
            modalContent.innerHTML = `
                <div class="modal-header d-flex align-items-center">
                    <h5 class="modal-title d-flex align-items-center gap-2">
                        <i class="bi bi-info-circle"></i>
                        <span>Activity</span>
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

customElements.define('activity-form', ActivityForm);

export default ActivityForm;

class ActivityLinkForm extends HTMLElement{

    activityData: ProjectActivityResponse;
    activitiesList: ProjectActivityResponse[];
    modifiedLinklist: PartialLink[];

    constructor (){
        super();
        this.activityData = {} as ProjectActivityResponse;
        this.activitiesList = [];
        this.modifiedLinklist = [];
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

    // Funzione per ottenere le attivitá disponibili per il linking
    // Supponiamo che la lista di activies é giá ordinata per data di fine
    private getAvailableActivities() {
        const availableActivities: ProjectActivityResponse[] = [];

        const startDate = new Date(this.activityData.dtStart);
        for (const activity of this.activitiesList) {
            // Se siamo arrivati all'attivitá corrente, interrompiamo, quelle successive hanno una due data maggiore
            if (activity._id === this.activityData._id) {
                break;
            }

            // Se l'attivitá é giá collegata o é giá stata selezionata, la saltiamo
            if(this.activityData.prevLinks.some(link => link._id === activity._id) || 
               this.modifiedLinklist.some(link => link._id === activity._id)) {
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

    private createForm() {
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

    private addItem(item: PartialLink) {
        const list = this.querySelector('#linkList');
        if (!list) return;

        const itemBlock = document.createElement('div');
        itemBlock.className = 'user-item d-flex justify-content-between align-items-center bg-light';
        itemBlock.setAttribute('data-link', item._id);

        itemBlock.innerHTML = `
            <span class="link-name">
                <i class="bi bi-link-45deg me-2"></i>
                ${item.name}
            </span>
            <button type="button" class="btn btn-danger btn-sm">
                <i class="bi bi-trash"></i>
            </button>
        `;

        itemBlock.querySelector('button')?.addEventListener('click', () => {
            this.modifiedLinklist = this.modifiedLinklist.filter(link => link._id !== item._id);
            itemBlock.remove();
        });

        list.appendChild(itemBlock);
    }

    private async handleSave(e: Event){
        e.preventDefault();
        const url = "/api/project/activity/link";
        const method = "PATCH";

        for (const link of this.modifiedLinklist) {
            const body = {
                "prevId": link._id,
                "nextId": this.activityData._id,
            }

            try{
                // TODO: Controllare
                const response = await fetcher(method, url, body);
                console.log(response);
            } catch (error) {
                console.error('Error linking activities:', error);
                alert('Failed to link activities');
            }
        }

        window.location.reload();
    }

    private setupEventListeners() {
        const btn = this.querySelector('#addLinkBtn');
        const newLink = this.querySelector('#newLink') as HTMLSelectElement;

        for (const link of this.modifiedLinklist) {
            this.addItem(link);
        }

        // Link management logic 
        btn?.addEventListener('click', () => {
            const selectedOption = newLink.options[newLink.selectedIndex];
            const value = selectedOption?.value;
            const name = selectedOption?.textContent;
            
            if (!value) return;

            const newItem: PartialLink = { name: name || value, _id: value };
            this.modifiedLinklist.push(newItem);
            this.addItem(newItem);
            
            newLink.innerHTML = this.createLinkItems();
            newLink.selectedIndex = 0;
        });

        const form = this.querySelector('#modifyLinkForm');
        form?.addEventListener('submit', this.handleSave);
    }

    private render(){
        this.innerHTML = `
            <div class="modal-header">
                <h5 class="modal-title">
                    <i class="bi bi-link"></i>
                    <span>Link Activities</span>
                </h5>
                <div class="ms-auto">
                    <button type="button" class="btn btn-sm btn-warning me-2" id="toggleEditBtn">
                        <i class="bi bi-x"></i>
                        Cancel
                    </button>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
            </div>
            <form id="modifyLinkForm">${this.createForm()}</form>
        `;
    }

    public initialize(
        activityData: ProjectActivityResponse,
        activitiesList: ProjectActivityResponse[],
        modifiedLinklist: PartialLink[]
    ){
        this.activityData = activityData;
        this.activitiesList = activitiesList;
        this.modifiedLinklist = modifiedLinklist;
        this.render();
        this.setupEventListeners();
    }
}

customElements.define('activity-link-form', ActivityLinkForm);

class ActivityDeleteForm extends HTMLElement{
    activityData: ProjectActivityResponse

    constructor (){
        super();
        this.activityData = {} as ProjectActivityResponse;
    }

    async handleDelete(e: Event){
        const url = "/api/project/activity/delete";
        const body = {
            _id: this.activityData._id
        }
        const method = "DELETE";

        try {
            // TODO: Controllare
            const response = await fetcher(method, url, body);
            console.log(response);
            window.location.reload();
        } catch (error) {
            console.error('Error deleting activity:', error);
            alert('Failed to delete activity');
        }


    }

    private setUpEventListeners(){
        const confirmBtn = this.querySelector('#confirmDeleteBtn');

        confirmBtn?.addEventListener('click', this.handleDelete);
    }

    private render(){
        this.innerHTML = `
            <div class="modal-header">
                <h5 class="modal-title text-danger d-flex align-items-center gap-2">
                    <i class="bi bi-exclamation-triangle-fill"></i>
                    <span>Delete Activity</span>
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
    }

    public initialize(activityData: ProjectActivityResponse){
        this.activityData = activityData;
        this.render();
        this.setUpEventListeners();
    }
}

customElements.define('activity-delete-form', ActivityDeleteForm);

class ActivityModifyForm extends HTMLElement {
    activityData: ProjectActivityResponse;
    phaseData: PhaseResponse;
    usersAvailable: string[];
    modifiedUserlist: string[];

    constructor() {
        super();
        this.activityData = {} as ProjectActivityResponse;
        this.phaseData = {} as PhaseResponse;
        this.usersAvailable = [];
        this.modifiedUserlist = [];
    }

    private async handleSubmit(event: Event) {
        event.preventDefault();
        const form = event.target as HTMLFormElement;
        const formData = new FormData(form);

        const data: any = {
            _id: this.activityData._id,
            summary: formData.get('summary') as string,
            description: formData.get('description') as string,
            dtStart: new Date((formData.get('dtStart') as string) + 'T00:00:00.000Z').toISOString(),
            due: new Date((formData.get('due') as string) + 'T23:59:59.999Z').toISOString(),
            isMilestone: formData.get('isMilestone') === 'on',
            usernameList: this.modifiedUserlist
        };

        const url = `/api/project/activity/modify`;
        const method = 'PATCH';

        try {
            await fetcher(method, url, data);
            window.location.reload();
        } catch (error) {
            console.error('Error modifying activity:', error);
            alert('Failed to modify activity');
        }

    }

    private createUsersSelect() {
        const availableUsers = this.usersAvailable.filter(user => !this.modifiedUserlist.includes(user));
        const text = availableUsers.length > 0 ? 'Select a user...' : 'No available users';

        let block = `<option value="" disabled selected>${text}</option>`;
        for (const user of availableUsers) {
            block += `
                <option value="${user}">${user}</option>
            `;
        }
        return block;
    }

    private updateUsersSelect(user: string, action: 'ADD' | 'REMOVE') {
        const select = this.querySelector('#newUser') as HTMLSelectElement;
        if (!select) return;

        if (action === 'ADD') {
            if (select.options.length === 1) {
                select.innerHTML = "<option value='' disabled selected>Select a user...</option>";
            }
            select.innerHTML += `<option value="${user}">${user}</option>`;
        } else {
            select.querySelectorAll('option').forEach(option => {
                if (option.value === user) {
                    option.remove();
                }
            });

            if (select.options.length === 1) {
                select.innerHTML = '<option value="" disabled selected>No available users</option>';
            }
        }
    }

    private createForm() {
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
                            <select class="form-select" id="newUser">
                                ${this.createUsersSelect()}
                            </select>
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
    private addUser(name: string) {
        const list = this.querySelector('#userList');
        if (!list) return;

        const itemBlock = document.createElement('div');
        itemBlock.className = 'user-item d-flex justify-content-between align-items-center bg-light';

        itemBlock.innerHTML = `
        <span class="user-name">
            <i class="bi bi-person-fill me-2"></i>
            ${name}
        </span>
        <button type="button" class="btn btn-danger btn-sm">
            <i class="bi bi-trash"></i>
        </button>
        `;

        itemBlock.querySelector('button')?.addEventListener('click', () => {
            itemBlock.remove();
            this.modifiedUserlist = this.modifiedUserlist.filter(user => user !== name);
            this.usersAvailable.push(name);
            if (this.modifiedUserlist.length === 0) {
                list.innerHTML = '<p class="text-muted">No users assigned</p>';
            }
            this.updateUsersSelect(name, 'ADD');
        });

        list.appendChild(itemBlock);
    }

    // Funzione per l'aggiunta e l'eliminazione degli utenti
    private setupItemManagement() {
        const btn = this.querySelector('#addUserBtn');
        const newUser = this.querySelector('#newUser') as HTMLSelectElement;

        for (const user of this.modifiedUserlist) {
            this.addUser(user);
        }
        
        if (this.modifiedUserlist.length === 0) {
            const userList = this.querySelector('#userList');
            if (userList) {
                userList.innerHTML = '<p class="text-muted">No users assigned</p>';
            }
        }

        btn?.addEventListener('click', () => {
            const name = newUser.value;
            if (!name) return;

            if (this.modifiedUserlist.length === 0) {
                const userList = this.querySelector('#userList');
                if (userList) {
                    userList.innerHTML = '';
                }
            }

            this.updateUsersSelect(name, 'REMOVE');
            this.modifiedUserlist.push(name);
            this.addUser(name);
            newUser.value = '';
        });

        const form = this.querySelector('#modifyActivityForm');
        form?.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    render() {
        this.innerHTML = `
            <div class="modal-header d-flex align-items-center">
                <h5 class="modal-title d-flex align-items-center gap-2">
                    <i class="bi bi-pencil-fill"></i>
                    <span>Modify Activity</span>
                </h5>
                <div class="ms-auto">
                    <button type="button" class="btn btn-sm btn-warning me-2" id="toggleEditBtn">
                        <i class="bi bi-x"></i>
                        Cancel
                    </button>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
            </div>
            <form id="modifyActivityForm">${this.createForm()}</form>
        `;
    }

    public initialize(activityData: ProjectActivityResponse, phaseData: PhaseResponse, usersList: string[], usersAvailable: string[]) {
        this.activityData = activityData;
        this.phaseData = phaseData;
        this.modifiedUserlist = [...usersList];
        this.usersAvailable = [...usersAvailable];
        this.render();
        this.setupItemManagement();
    }

}

customElements.define('activity-modify-form', ActivityModifyForm);