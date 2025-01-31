interface ProjectSettingsData {
    title: string;
    users: string[];
}

class ProjectSettings extends HTMLElement {
    constructor() {
        super();
    }

    static get observedAttributes() {
        return ['users', 'title'];
    }

    connectedCallback() {
        this.render();
    }

    private render() {

        const template = `
            <button class="btn-link btn p-2 rounded-circle" data-bs-toggle="modal" data-bs-target="#settingsModal">
                <i class="bi bi-gear-fill fs-5 settings-btn"></i>
            </button>

            <div class="modal fade" id="settingsModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
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
                                    <input type="text" class="form-control" id="projectTitle" required>
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
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annulla</button>
                            <button type="button" class="btn btn-primary" id="saveChanges">Salva Modifiche</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.innerHTML = template;
        this.setupEventListeners();
    }

    private validateProjectTitle(title: string): boolean {
        return title.length >= 3 && title.length <= 50;
    }

    private validateUsername(username: string): boolean {
        const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
        return usernameRegex.test(username);
    }

    // Funzione per mostrare un messaggio di errore sotto l'input
    private showError(inputElement: HTMLElement, message: string) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'invalid-feedback d-block';
        errorDiv.textContent = message;
        inputElement.classList.add('is-invalid');
        inputElement.parentElement?.appendChild(errorDiv);
    }

    // Funzione per rimuovere il messaggio di errore quando l'input è corretto
    private clearError(inputElement: HTMLElement) {
        inputElement.classList.remove('is-invalid');
        const errorDiv = inputElement.parentElement?.querySelector('.invalid-feedback');
        if (errorDiv) errorDiv.remove();
    }

    // Funzione per gestire gli eventi
    private setupEventListeners() {
        const addUserBtn = this.querySelector('#addUserBtn');
        const newUserInput = this.querySelector('#newUser') as HTMLInputElement;
        const saveBtn = this.querySelector('#saveChanges');

        addUserBtn?.addEventListener('click', () => {
            const username = newUserInput?.value.trim();
            if (username) {
                this.clearError(newUserInput);
                if (this.validateUsername(username)) {
                    // TODO - fare il controllo che gli utenti esistano e non siano già presenti
                    this.addUser({ name: username, id: username });
                    newUserInput.value = '';
                } else {
                    this.showError(newUserInput, 'Username non valido (3-20 caratteri, solo lettere, numeri, - e _)');
                }
            }
        });

        saveBtn?.addEventListener('click', () => {
            const projectTitleInput = this.querySelector('#projectTitle') as HTMLInputElement;
            const projectTitle = projectTitleInput?.value.trim();
            
            
            if (!this.validateProjectTitle(projectTitle)) {
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

    // Callback per la modifica degli attributi
    attributeChangedCallback(name: string, _oldValue: string, newValue: string) {
        try {
            if (name === 'users') {
                if (!newValue || newValue === '[]') return;
                const users = JSON.parse(newValue);
                for (const user of users) {
                    this.addUser(user);
                }
            }
            if (name === 'title') {
                const titleInput = this.querySelector('#projectTitle') as HTMLInputElement;
                if (titleInput && this.validateProjectTitle(newValue)) {
                    titleInput.value = newValue;
                }
            }
        } catch (error) {
            console.error('Errore nella validazione degli attributi:', error);
        }
    }
}

customElements.define('project-settings', ProjectSettings);

export default ProjectSettings;
