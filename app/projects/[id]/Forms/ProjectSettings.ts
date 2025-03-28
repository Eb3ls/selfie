import {
	User,
	clearError,
	createUserEntry,
	escapeHTML,
	fetcher,
	showError,
	validateLength
} from "../Utils";

class ProjectSettings extends HTMLElement {
	projectTitle: string;
	projectId: string;
	owner: User;
	users: User[];
	currentUser: User | null;
	// Lista degli utenti da mantenere
	selectedUser: User[];
	usersToInvite: string[];

	constructor() {
		super();
		this.projectTitle = "";
		this.projectId = "";
		this.owner = { name: "", id: "" };
		this.users = [];
		this.currentUser = null;
		this.selectedUser = [];
		this.usersToInvite = [];
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

	public loadProjectData(
		title: string,
		id: string,
		users: User[],
		currentUser: User
	) {
		if (!title || !users || !id) return;
		this.projectTitle = title;
		this.projectId = id;
		this.users = users;
		// Eliminiamo il primo utente che é sempre l'owner del progetto
		this.owner = this.users.shift() as User;
		this.currentUser = currentUser;
		this.updateModalContent("VIEW");
	}

	private updateModalContent(type: "VIEW" | "EDIT" | "DELETE" | "INVITE") {
		const modalContent = this.querySelector(".modal-content");
		if (!modalContent) return;

		if (type === "VIEW") {
			modalContent.innerHTML = this.createViewTemplate();
			this.setupViewEventListeners();
		} else if (type === "EDIT") {
			this.selectedUser = this.users;
			modalContent.innerHTML = this.createModifyTemplate();
			this.setupModifyEventListeners();
		} else if (type === "DELETE") {
			modalContent.innerHTML = this.createDeleteTemplate();
			this.setupDeleteEventListeners();
		} else if (type === "INVITE") {
			modalContent.innerHTML = this.createInviteTemplate();
			this.setupInviteEventListeners();
		}
	}

	private setupViewEventListeners() {
		const editBtn = this.querySelector("#editBtn");
		editBtn?.addEventListener("click", () =>
			this.updateModalContent("EDIT")
		);

		const deleteBtn = this.querySelector("#deleteBtn");
		deleteBtn?.addEventListener("click", () =>
			this.updateModalContent("DELETE")
		);

		const inviteBtn = this.querySelector("#inviteBtn");
		inviteBtn?.addEventListener("click", () =>
			this.updateModalContent("INVITE")
		);

		const userListView = this.querySelector("#userListView");
		if (userListView) {
			const ownerBlock = createUserEntry(this.owner, false, null);
			userListView.appendChild(ownerBlock);
			this.users.forEach((user) => {
				const userBlock = createUserEntry(user, false, null);
				userListView.appendChild(userBlock);
			});
		}
	}

	private createViewTemplate() {
		const isOwner = this.currentUser?.name === this.owner.name;
		return `
			<div class="modal-header">
				<h5 class="modal-title">
					<i class="bi bi-info-circle"></i>
					<span>Impostazioni Progetto</span>
				</h5>
				<div class="ms-auto d-flex align-items-center">
					${
						isOwner
							? `
								<button type="button" class="btn btn-sm btn-danger me-2" id="deleteBtn">
									<i class="bi bi-trash"></i>
									Elimina
								</button>
								<button type="button" class="btn btn-sm btn-primary me-2" id="editBtn">
									<i class="bi bi-pencil"></i>
									Modifica
								</button>
								<button type="button" class="btn btn-sm btn-success me-2" id="inviteBtn">
									<i class="bi bi-person-plus"></i>
									Invita utenti
								</button>
							`
							: ""
					}
					<button type="button" class="btn-close" data-bs-dismiss="modal"></button>
				</div>
			</div>
			<div class="modal-body">
				<div class="mb-4">
					<label class="form-label text-muted small">Titolo</label>
					<h4>${escapeHTML(this.projectTitle)}</h4>
				</div>
				
				<div class="mb-4">
					<label class="form-label text-muted small">Utenti</label>
					<div class="user-list">
						<div id="userListView">
						</div>
					</div>
				</div>
			</div>
			<div class="modal-footer">
				<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Chiudi</button>
			</div>
		`;
	}

	private async handleModifySubmit(event: Event) {
		event?.preventDefault();
		const projectTitleInput = this.querySelector(
			"#projectTitle"
		) as HTMLInputElement;
		const projectTitle = projectTitleInput.value.trim();

		clearError(projectTitleInput);

		if (!validateLength(projectTitle, 3, 50)) {
			showError(
				projectTitleInput,
				"Il titolo deve essere tra 3 e 50 caratteri"
			);
			return;
		}

		const method = "PATCH";
		const url = "/api/project/modify";
		const body: any = {
			_id: this.projectId,
			summary: projectTitle,
			usernameList: this.selectedUser.map((user) => user.name)
		};

		try {
			await fetcher(method, url, body);
			window.location.reload();
		} catch (error) {
			alert("Errore durante la modifica del progetto");
		}
	}

	private setupModifyEventListeners() {
		const saveBtn = this.querySelector("#saveChanges");
		saveBtn?.addEventListener("click", (e) => this.handleModifySubmit(e));

		const cancelBtn = this.querySelector("#toggleEditBtn");
		cancelBtn?.addEventListener("click", () =>
			this.updateModalContent("VIEW")
		);

		// Populate current users list in modify view
		const userList = this.querySelector("#userListModify");
		if (userList) {
			userList.innerHTML = "";
			const ownerBlock = createUserEntry(this.owner, false, null);
			userList.appendChild(ownerBlock);
			this.users.forEach((user) => {
				const deleteCallback = (e: any) => {
					const clickedElement = e.target as HTMLElement;
					const itemElement = clickedElement.closest(".entry-item");
					itemElement?.remove();
					this.selectedUser = this.selectedUser.filter(
						(selected) => selected.name !== user.name
					);
				};
				const userBlock = createUserEntry(user, true, deleteCallback);
				userList.appendChild(userBlock);
			});
		}
	}

	private createModifyTemplate() {
		return `
            <div class="modal-header">
                <h5 class="modal-title">
                    <i class="bi bi-pencil-fill"></i>
                    <span>Modifica Progetto</span>
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
                <form id="projectForm">
                    <div class="mb-4">
                        <label class="form-label fw-semibold">Titolo Progetto</label>
                        <input type="text" class="form-control" id="projectTitle" value="${this.projectTitle}" required>
                    </div>
                    <div class="mb-4">
                        <label class="form-label text-muted small">Utenti attuali</label>
                        <div class="user-list" id="userListModify">
                        </div>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button type="submit" class="btn btn-primary" id="saveChanges">Salva</button>
            </div>
        `;
	}

	private setupInviteEventListeners() {
		const addInviteUserBtn = this.querySelector("#addInviteUserBtn");
		const inviteInput = this.querySelector(
			"#inviteName"
		) as HTMLInputElement;
		const inviteUserList = this.querySelector("#inviteUserList");

		addInviteUserBtn?.addEventListener("click", () => {
			const username = inviteInput?.value.trim();
			if (!username) return;
			clearError(inviteInput);
			if (this.owner.name === username) {
				showError(
					inviteInput,
					`L'utente è già il proprietario del progetto`
				);
				return;
			}

			if (this.users.some((user) => user.name === username)) {
				showError(inviteInput, "Utente già presente nel progetto!");
				return;
			}
			if (this.usersToInvite.includes(username)) {
				showError(inviteInput, "Utente già presente nella lista!");
				return;
			}

			if (
				inviteUserList &&
				inviteUserList.innerHTML.includes("Nessun utente da invitare!")
			) {
				inviteUserList.innerHTML = "";
			}

			this.usersToInvite.push(username);

			const deleteCallback = (e: any) => {
				const clickedElement = e.target as HTMLElement;
				const itemElement = clickedElement.closest(".entry-item");
				itemElement?.remove();

				this.usersToInvite = this.usersToInvite.filter(
					(user) => user !== username
				);
				if (inviteUserList && inviteUserList.children.length === 0) {
					inviteUserList.innerHTML =
						'<p class="text-muted">Nessun utente da invitare!</p>';
				}
			};
			const userEntry = createUserEntry(
				{ name: username, id: "" },
				true,
				deleteCallback
			);
			inviteUserList?.appendChild(userEntry);
			inviteInput.value = "";
		});

		const saveBtn = this.querySelector("#saveChanges");
		saveBtn?.addEventListener("click", (e) => {
			e.preventDefault();
			alert("Invitando i seguenti utenti: " + this.usersToInvite);
		});

		const cancelBtn = this.querySelector("#toggleEditBtn");
		cancelBtn?.addEventListener("click", () =>
			this.updateModalContent("VIEW")
		);
	}

	private createInviteTemplate() {
		return `
            <div class="modal-header">
                <h5 class="modal-title">
                    <i class="bi bi-person-plus-fill"></i>
                    <span>Invita Utenti</span>
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
                <form id="inviteForm">
                    <div class="mb-4">
                        <label class="form-label fw-semibold" for="inviteName">Nome utente</label>
                        <div class="input-group">
                            <input type="text" class="form-control" id="inviteName" placeholder="Scrivi il nome utente">
                            <button type="button" class="btn btn-primary rounded-end-3" id="addInviteUserBtn">
                                <i class="bi bi-plus-lg"></i>
                            </button>
                        </div>
                    </div>
                    <div class="mb-4">
                        <label class="form-label text-muted small">Utenti da invitare</label>
                        <div class="user-list" id="inviteUserList">
                            <p class="text-muted">Nessun utente da invitare!</p>
                        </div>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button type="submit" class="btn btn-primary" id="saveChanges">Salva</button>
            </div>
		`;
	}

	// Blocco per l'eliminazione del progetto
	private setupDeleteEventListeners() {
		const cancelBtn = this.querySelector("#toggleEditBtn");
		cancelBtn?.addEventListener("click", () =>
			this.updateModalContent("VIEW")
		);

		const confirmBtn = this.querySelector("#confirmDeleteBtn");
		confirmBtn?.addEventListener("click", async () => {
			const url = `/api/project/delete`;
			const method = "DELETE";
			const body = { _id: this.projectId };
			try {
				await fetcher(method, url, body);
				window.location.href = "/projects";
			} catch (error) {
				alert("Impossibile eliminare il progetto");
			}
		});
	}

	private createDeleteTemplate() {
		return `
            <div class="modal-header">
                <h5 class="modal-title text-danger">
                    <i class="bi bi-exclamation-triangle-fill"></i>
                    <span>Elimina Progetto</span>
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
                <p class="fs-5">Sei sicuro di voler eliminare il progetto?</p>
                <p class="text-danger">Questa operazione non può essere annullata!</p>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-danger" id="confirmDeleteBtn">Elimina Progetto</button>
            </div>
        `;
	}
}

customElements.define("project-settings", ProjectSettings);

export default ProjectSettings;
