import {user, validateUsername, validateLenght} from "../Utils";
interface ProjectSettingsData {
    title: string;
    users: string[];
}

class ProjectSettings extends HTMLElement {
    title: string;
    users: user[];
    modifiedUsers: user[];

    constructor() {
        super();
        this.title = '';
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

    public loadProjectData(title: string, users: user[]) {
        if(!title || !users) return;
        this.title = title;
        this.users = [...users];
        this.modifiedUsers = [...users];
        this.updateModalContent("VIEW");
    }

    private updateModalContent(type: "VIEW" | "EDIT" | "DELETE") {
        const modalContent = this.querySelector('.modal-content');
        if (!modalContent) return;

        if(type === "VIEW") {
            modalContent.innerHTML = this.createViewTemplate();
            this.setupViewEventListeners();
        } else if(type === "EDIT") {
            modalContent.innerHTML = this.createModifyTemplate();
            this.setupModifyEventListeners();
        } else if(type === "DELETE") {
            modalContent.innerHTML = this.createDeleteTemplate();
            this.setupDeleteEventListeners();
        }
    }

    // BLOCCO PER LA VISUALIZZAZIONE DEL PROGETTO
    private setupViewEventListeners() {
        const editBtn = this.querySelector('#editBtn');
        editBtn?.addEventListener('click', () => this.updateModalContent("EDIT"));

        const deleteBtn = this.querySelector('#deleteBtn');
        deleteBtn?.addEventListener('click', () => this.updateModalContent("DELETE"));

        const userListView = this.querySelector('#userListView');
        if (userListView) {
            if (this.users.length > 0) {
                userListView.innerHTML = this.users.map((user: any) => `
                    <div class="user-item d-flex align-items-center mb-2">
                        <i class="bi bi-person-fill me-2"></i>
                        ${user.name}
                    </div>
                `).join('');
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

    // BLOCCO PER LA MODIFICA DEL PROGETTO

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

    // Aggiunge un utente alla lista della modify
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
            if (username) {
                this.clearError(newUserInput);
                if (validateUsername(username)) {
                    // TODO - fare il controllo che gli utenti esistano e non siano già presenti
                    this.addUser({ name: username, id: username });
                    newUserInput.value = '';
                } else {
                    this.showError(newUserInput, 'Username non valido (3-20 caratteri, solo lettere, numeri, - e _)');
                }
            }
        });

        const saveBtn = this.querySelector('#saveChanges');
        saveBtn?.addEventListener('click', () => {
            const projectTitleInput = this.querySelector('#projectTitle') as HTMLInputElement;
            const projectTitle = projectTitleInput?.value.trim();
            
            
            if (!validateLenght(projectTitle, 3, 100)) {
                this.showError(projectTitleInput, 'Il titolo deve essere tra 3 e 100 caratteri');
                return;
            }

            const users = Array.from(this.querySelectorAll('.user-item') || [])
                .map(item => item.getAttribute('data-user'))
                .filter((user): user is string => user !== null);

            const settingsData: ProjectSettingsData = {
                title: projectTitle,
                users
            };

            // TODO - inviare i dati al server
            console.log('Dati da salvare:', settingsData);
        });

        const cancelBtn = this.querySelector('#cancelModifyBtn');
        cancelBtn?.addEventListener('click', () => this.updateModalContent("VIEW"));
    }

    private createModifyTemplate() {
        return `
            <div class="modal-header">
                <h5 class="modal-title">
                    <i class="bi bi-gear-fill me-2"></i>
                    Impostazioni Progetto
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
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
                <button type="button" class="btn btn-secondary" id="cancelModifyBtn">Annulla</button>
                <button type="button" class="btn btn-primary" id="saveChanges">Salva Modifiche</button>
            </div>
        `;
    }

    // BLOCCO PER L'ELIMINAZIONE DEL PROGETTO

    private setupDeleteEventListeners() {
        const cancelBtn = this.querySelector('#cancelDeleteBtn');
        cancelBtn?.addEventListener('click', () => this.updateModalContent("VIEW"));

        const confirmBtn = this.querySelector('#confirmDeleteBtn');
        confirmBtn?.addEventListener('click', async () => {
            try {
                // TODO: Implement project deletion API call
                const response = await fetch('/api/project/delete', {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ projectId: this.getAttribute('projectId') })
                });

                if (response.ok) {
                    window.location.href = '/projects';
                } else {
                    throw new Error('Failed to delete project');
                }
            } catch (error) {
                console.error('Error deleting project:', error);
                alert('Failed to delete project');
            }
        });
    }

    private createDeleteTemplate() {
        return `
            <div class="modal-header">
                <h5 class="modal-title text-danger">
                    <i class="bi bi-exclamation-triangle-fill me-2"></i>
                    Delete Project
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
                <p class="fs-5">Are you sure you want to delete this project?</p>
                <p class="text-danger">This action cannot be undone!</p>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" id="cancelDeleteBtn">Cancel</button>
                <button type="button" class="btn btn-danger" id="confirmDeleteBtn">Delete Project</button>
            </div>
        `;
    }
}

customElements.define('project-settings', ProjectSettings);

export default ProjectSettings;
