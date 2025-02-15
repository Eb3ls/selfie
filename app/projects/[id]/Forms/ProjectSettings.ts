import {User, validateUsername, validateLength, fetcher, clearError, showError} from "../Utils";

class ProjectSettings extends HTMLElement {
    title: string;
    id: string;
    owner: string;
    users: string[];
    modifiedUsers: string[];

    constructor() {
        super();
        this.title = '';
        this.id = '';
        this.owner = '';
        this.users = [];
        this.modifiedUsers = [];
    }

    connectedCallback() {
        this.innerHTML = `
            <button class="btn-link btn p-2 rounded-circle" data-bs-toggle="modal" data-bs-target="#settingsModal">
                <i class="bi bi-gear-fill fs-5 settings-btn"></i>
            </button>

            <div class="modal fade" id="settingsModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                    </div>
                </div>
            </div>
        `;
    }

    public loadData(title: string, id: string, users: User[]) {
        if(!title || !users || !id) return;
        this.title = title;
        this.id = id;
        this.users = users.map(user => user.name);
        // Eliminiamo il primo utente che é sempre l'owner del progetto
        this.owner = this.users.shift() || '';
        this.updateModalContent("VIEW");
    }

    private updateModalContent(type: "VIEW" | "EDIT" | "DELETE") {
        const modalContent = this.querySelector('.modal-content');
        if (!modalContent) return;

        if(type === "VIEW") {
            modalContent.innerHTML = this.createViewTemplate();
            this.setupViewEventListeners();
        } else if(type === "EDIT") {
            this.modifiedUsers = this.users;
            modalContent.innerHTML = this.createModifyTemplate();
            this.setupModifyEventListeners();
        } else if(type === "DELETE") {
            modalContent.innerHTML = this.createDeleteTemplate();
            this.setupDeleteEventListeners();
        }
    }

    private setupViewEventListeners() {
        const editBtn = this.querySelector('#editBtn');
        editBtn?.addEventListener('click', () => this.updateModalContent("EDIT"));

        const deleteBtn = this.querySelector('#deleteBtn');
        deleteBtn?.addEventListener('click', () => this.updateModalContent("DELETE"));

        const userListView = this.querySelector('#userListView');
        if (userListView) {
            if (this.users.length > 0) {
                userListView.innerHTML = '';
                this.users.forEach(user => {
                    userListView.innerHTML += `<div class="user-item d-flex align-items-center mb-2">
                            <i class="bi bi-person-fill me-2"></i>
                            ${user}
                        </div>`;
                });
            } else {
                userListView.innerHTML = '<p class="text-muted">No users assigned</p>';
            }
        }
    }

    private createViewTemplate() {
        return `
            <div class="modal-header d-flex align-items-center">
                <h5 class="modal-title d-flex align-items-center gap-2">
                    <i class="bi bi-info-circle"></i>
                    <span>Impostazioni progetto</span>
                </h5>
                <div class="ms-auto">
                    <button type="button" class="btn btn-sm btn-danger me-2" id="deleteBtn">
                        <i class="bi bi-trash"></i>
                        Delete
                    </button>
                    <button type="button" class="btn btn-sm btn-outline-primary me-2" id="editBtn">
                        <i class="bi bi-pencil"></i>
                        Modify
                    </button>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
            </div>
            <div class="modal-body">
                <div class="mb-4">
                    <label class="form-label text-muted small">Project Title</label>
                    <h4 id="projectTitleView">${this.title}</h4>
                </div>
                
                <div class="mb-4">
                    <label class="form-label text-muted small">Project Users</label>
                    <div class="user-list">
                        <div id="userListView">
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            </div>
        `;
    }

    private async handleModifySubmit(event: Event) {
        event?.preventDefault();
        const projectTitleInput = this.querySelector('#projectTitle') as HTMLInputElement;
        const projectTitle = projectTitleInput.value.trim();
        
        if (!validateLength(projectTitle, 3, 100)) {
            showError(projectTitleInput, 'Il titolo deve essere tra 3 e 100 caratteri');
            return;
        }

        const method = "PATCH";
        const url = "/api/project/modify";
        const body: any = {
            _id: this.id,
            summary: projectTitle,
            usernameList: this.modifiedUsers
        };

        try {
            await fetcher(method, url, body);
            window.location.reload();
        } catch (error) {
            console.error('Error modifying project:', error);
            alert('Failed to modify project');
        }
    }

    // Aggiunge un utente alla lista della modify
    private addUser(username: string) {
        const userList = this.querySelector('#userList');
        if (!userList) return;

        const userItem = document.createElement('div');
        userItem.className = 'user-item d-flex justify-content-between align-items-center bg-light';
        
        userItem.innerHTML = `
            <span class="user-name">
                <i class="bi bi-person-fill me-2"></i>
                ${username}
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

    private setupModifyEventListeners() {
        // Aggiungiamo gli utenti già presenti
        for (const user of this.modifiedUsers) {
            this.addUser(user);
        }

        const addUserBtn = this.querySelector('#addUserBtn');
        const newUserInput = this.querySelector('#newUser') as HTMLInputElement;

        // Aggiungiamo l'evento per l'aggiunta di un nuovo utente alla lista
        addUserBtn?.addEventListener('click', () => {
            const username = newUserInput?.value.trim();
            if (!username) return
            clearError(newUserInput);

            if (this.owner === username) {
                showError(newUserInput, `L'utente è già il proprietario del progetto`);
                return;
            }

            if (this.modifiedUsers.includes(username)) {
                showError(newUserInput, 'Utente già presente');
                return;
            }

            if (validateUsername(username)) {
                this.modifiedUsers.push(username);
                this.addUser(username);
                newUserInput.value = '';
            } else {
                showError(newUserInput, 'Username non valido (3-20 caratteri, solo lettere, numeri, - e _)');
            }
        });

        const saveBtn = this.querySelector('#saveChanges');
        saveBtn?.addEventListener('click', (e) => this.handleModifySubmit(e));

        const cancelBtn = this.querySelector('#toggleEditBtn');
        cancelBtn?.addEventListener('click', () => this.updateModalContent("VIEW"));
    }

    private createModifyTemplate() {
        return `
            <div class="modal-header">
                <h5 class="modal-title d-flex align-items-center gap-2">
                    <i class="bi bi-pencil-fill"></i>
                    <span>Modify Project</span>
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
                <form id="projectForm">
                    <div class="mb-4">
                        <label class="form-label fw-bold">Titolo Progetto</label>
                        <input type="text" class="form-control" id="projectTitle" value=${this.title} required>
                    </div>
                    
                    <div class="mb-4">
                        <label class="form-label fw-bold">Gestione Utenti</label>
                        <div class="add-user-form">
                            <div class="input-group">
                                <input type="text" class="form-control" id="newUser" placeholder="Aggiungi nuovo utente">
                                <button type="button" class="btn btn-primary" id="addUserBtn">
                                    <i class="bi bi-plus-lg"></i> Aggiungi
                                </button>
                            </div>
                        </div>
                        <div class="user-list" id="userList"></div>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button type="submit" class="btn btn-primary" id="saveChanges">Salva Modifiche</button>
            </div>
        `;
    }

    // Blocco per l'eliminazione del progetto
    private setupDeleteEventListeners() {
        const cancelBtn = this.querySelector('#toggleEditBtn');
        cancelBtn?.addEventListener('click', () => this.updateModalContent("VIEW"));

        const confirmBtn = this.querySelector('#confirmDeleteBtn');
        confirmBtn?.addEventListener('click', async () => {
            const url = `/api/project/delete/${this.id}`;
            const method = 'DELETE';
            const body = {_id: this.id};
            try {
                await fetcher(method, url, body);
                window.location.href = '/projects';
            } catch (error) {
                console.error('Error deleting project:', error);
                alert('Failed to delete project');
            }
        });
    }

    private createDeleteTemplate() {
        return `
            <div class="modal-header">
                <h5 class="modal-title text-danger d-flex align-items-center gap-2">
                    <i class="bi bi-exclamation-triangle-fill"></i>
                    <span>Delete Project</span>
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
                <p class="fs-5">Are you sure you want to delete this project?</p>
                <p class="text-danger">This action cannot be undone!</p>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-danger" id="confirmDeleteBtn">Delete Project</button>
            </div>
        `;
    }
}

customElements.define('project-settings', ProjectSettings);

export default ProjectSettings;
