import {
	PhaseResponse,
	ProjectActivityResponse,
	SubPhaseResponse
} from "@/app/api/(auth)/project/[id]/route";
import { safeFetch } from "@/utils/fetch/fetch";
import { toast } from "react-toastify";
import {
	User,
	clearError,
	createLinkEntry,
	createUserEntry,
	escapeHTML,
	formatDate,
	formatDueDate,
	formatStartDate,
	hideModal,
	showError,
	validateLength
} from "../Utils";
import ViewToggler from "../ViewToggler";

interface PartialLink {
	name: string;
	_id: string;
}

class ActivityForm extends HTMLElement {
	parentPhase: PhaseResponse | SubPhaseResponse;
	activity: ProjectActivityResponse;
	activitiesList: ProjectActivityResponse[];
	usersAvaiable: User[];
	usersList: User[];
	selectedLinks: PartialLink[];
	isOwner: boolean;

	constructor() {
		super();
		this.parentPhase = {} as PhaseResponse;
		this.activity = {} as ProjectActivityResponse;
		this.activitiesList = [];
		this.usersAvaiable = [];
		this.usersList = [];
		this.selectedLinks = [];
		this.isOwner = false;
	}

	// Renderizziamo il componente senza contenuto
	connectedCallback() {
		this.innerHTML = `
            <div class="modal fade" id="ModifyActivity">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                    </div>
                </div>
            </div>
        `;

		this.id = "ModifyActivityComponent";
	}

	// Funzione chiamata per fornire i dati generali, chimata da viewToggler
	public loadProjectData(
		activitiesList: ProjectActivityResponse[],
		usersAvaiable: User[],
		isOwner: boolean
	) {
		this.activitiesList = [...activitiesList];
		this.usersAvaiable = [...usersAvaiable];
		this.isOwner = isOwner;
	}

	// Funzione per fornire i dati dell'activity specifica
	public updateData(
		activity: ProjectActivityResponse,
		parentPhase: PhaseResponse | SubPhaseResponse
	) {
		if (!activity || !parentPhase) return;
		this.activity = activity;
		// Necessario per capire il range di date disponibili
		this.parentPhase = parentPhase;
		this.usersList = this.activity.users || [];
		this.selectedLinks = [];
		for (const link of this.activity.prevLinks) {
			this.selectedLinks.push({
				name: link.summary,
				_id: link._id
			});
		}
		this.updateModalContent("VIEW");
	}

	private createViewTemplate() {
		// Creiamo il blocco per le attivitá associate
		let selectedLinksBlock = "";
		if (this.activity.prevLinks.length > 0) {
			for (const link of this.activity.prevLinks) {
				const linkBlock = createLinkEntry(
					link.summary,
					link.noteId,
					false,
					null
				);
				selectedLinksBlock += linkBlock.outerHTML;
			}
		} else {
			selectedLinksBlock =
				'<p class="text-muted">Nessuna attività associata</p>';
		}

		// Creiamo il blocco per gli utenti selezionati
		let selectedUsersBlock = "";
		if (this.usersList.length > 0) {
			for (const user of this.usersList) {
				const userBlock = createUserEntry(user, false, null);
				selectedUsersBlock += userBlock.outerHTML;
			}
		} else {
			selectedUsersBlock =
				'<p class="text-muted">Nessun utente assegnato</p>';
		}

		const titleBlock = `
			<div class="d-flex align-items-start gap-3 mb-4">
				<div class="flex-grow-1">
					<label class="form-label text-muted small">Titolo</label>
					<h4 class="mb-0 text-break">${escapeHTML(this.activity.summary)}</h4>
				</div>
				${
					this.activity.isMilestone
						? `<div class="flex-shrink-0">
							<span class="badge bg-primary fs-6 d-inline-flex align-items-center">
								<i class="bi bi-flag-fill me-1"></i>
								Milestone
							</span>
						</div>`
						: ""
				}
			</div>
		`;

		return `
			<div class="modal-body">
				${titleBlock}
				
				<div class="mb-4">
					<label class="form-label text-muted small">Descrizione</label>
					<div class="fs-5 text-wrap" style="max-height: 200px; overflow-y: auto; white-space: pre-wrap; overflow-wrap: break-word;">
						${escapeHTML(this.activity.description || "Nessuna descrizione fornita")}
					</div>
				</div>

				<div class="mb-4">
					<div class="row">
						<div class="col-md-6">
							<label class="form-label text-muted small">Data d'inizio</label>
							<h5>${new Date(this.activity.dtStart).toLocaleDateString()}</h5>
						</div>
						<div class="col-md-6">
							<label class="form-label text-muted small">Data di fine</label>
							<h5>${new Date(formatDate(this.activity.due)).toLocaleDateString()}</h5>
						</div>
					</div>
				</div>

				<div class="mb-4">
					${createLinkEntry("Nota della attività", this.activity.noteId!, false, null).outerHTML}
				</div>

				<div class="mb-4">
					<label class="form-label text-muted small">Utenti assegnati</label>
					<div class="user-list">
						${selectedUsersBlock}
					</div>
				</div>

				<div class="mb-4">
					<label class="form-label text-muted small">Attività associate</label>
					<div class="user-list">
						${selectedLinksBlock}
					</div>
				</div>
			</div>
			<div class="modal-footer">
				<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Chiudi</button>
			</div>
		`;
	}

	private updateModalContent(mode: "VIEW" | "EDIT" | "LINK" | "DELETE") {
		const modalContent = this.querySelector(".modal-content");
		if (!modalContent) return;

		modalContent.innerHTML = "";
		if (mode === "DELETE") {
			const body = new ActivityDeleteForm();
			body.initialize(this.activity);
			modalContent.appendChild(body);

			const toggleBtn = modalContent.querySelector("#toggleEditBtn");
			toggleBtn?.addEventListener("click", () =>
				this.updateModalContent("VIEW")
			);
		} else if (mode === "EDIT") {
			const body = new ActivityModifyForm();
			body.initialize(
				this.activity,
				this.parentPhase,
				this.usersList,
				this.usersAvaiable
			);
			modalContent.appendChild(body);

			const toggleBtn = modalContent.querySelector("#toggleEditBtn");
			toggleBtn?.addEventListener("click", () =>
				this.updateModalContent("VIEW")
			);
		} else if (mode === "LINK") {
			const body = new ActivityLinkForm();
			body.initialize(
				this.activity,
				this.activitiesList,
				this.selectedLinks
			);
			modalContent.appendChild(body);

			const toggleBtn = modalContent.querySelector("#toggleEditBtn");
			toggleBtn?.addEventListener("click", () =>
				this.updateModalContent("VIEW")
			);
		} else {
			// Mettiamo il bottone per il linking solo se l'attivitá é attivabile o in attesa
			const linkButton =
				this.activity.status === "ACTIVABLE" ||
				this.activity.status === "WAITING"
					? `<button type="button" class="btn btn-sm btn-primary me-2" id="linkBtn">
						<i class="bi bi-link
						"></i>
						Associa
					</button>`
					: "";

			const modifyButton =
				this.activity.status !== "COMPLETED" &&
				this.activity.status !== "DROPPED"
					? `<button type="button" class="btn btn-sm btn-primary me-2" id="editBtn">
					<i class="bi bi-pencil"></i>
					Modifica
				</button>`
					: "";

			modalContent.innerHTML = `
				<div class="modal-header">
					<h5 class="modal-title">
						<i class="bi bi-info-circle"></i>
						<span>Attività</span>
					</h5>
					<div class="ms-auto d-flex align-items-center">
						${
							this.isOwner
								? `
						<button type="button" class="btn btn-sm btn-danger me-2" id="deleteBtn">
							<i class="bi bi-trash"></i>
							Elimina
						</button>
						${linkButton + modifyButton}
						`
								: ""
						}
						<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
					</div>
				</div>
				${this.createViewTemplate()}
			`;

			const deleteBtn = modalContent.querySelector("#deleteBtn");
			deleteBtn?.addEventListener("click", () =>
				this.updateModalContent("DELETE")
			);

			const linkBtn = modalContent.querySelector("#linkBtn");
			linkBtn?.addEventListener("click", () =>
				this.updateModalContent("LINK")
			);

			const editBtn = modalContent.querySelector("#editBtn");
			editBtn?.addEventListener("click", () =>
				this.updateModalContent("EDIT")
			);
		}
	}
}

customElements.define("activity-form", ActivityForm);

export default ActivityForm;

class ActivityLinkForm extends HTMLElement {
	activity: ProjectActivityResponse;
	activitiesList: ProjectActivityResponse[];
	avaiableActivities: PartialLink[];
	selectedLinks: PartialLink[];

	constructor() {
		super();
		this.activity = {} as ProjectActivityResponse;
		this.activitiesList = [];
		this.avaiableActivities = [];
		this.selectedLinks = [];
	}

	private populateAvailableLinks() {
		const text =
			this.avaiableActivities.length > 0
				? "Seleziona un'attività..."
				: "Nessuna attività disponibile";

		let block = `<option value="" disabled selected>${text}</option>`;
		for (const activity of this.avaiableActivities) {
			block += `
                <option value="${activity._id}">${escapeHTML(activity.name)}</option>
            `;
		}

		const select = this.querySelector(
			"#avaiableLinks"
		) as HTMLSelectElement;
		if (select) {
			select.innerHTML = block;
		}
	}

	// Funzione per ottenere le attivitá disponibili per il linking
	// Supponiamo che la lista di activies é giá ordinata per data di fine
	private getAvailableActivities() {
		const availableActivities: ProjectActivityResponse[] = [];

		const startDate = new Date(this.activity.dtStart);
		for (const activity of this.activitiesList) {
			// Se siamo arrivati all'attivitá corrente, interrompiamo, quelle successive hanno una due data maggiore
			if (activity._id === this.activity._id) {
				break;
			}

			// Se l'attivitá é giá collegata o é giá stata selezionata o é giá stata attivata, la saltiamo
			if (
				this.activity.prevLinks.some(
					(link) => link._id === activity._id
				) ||
				this.selectedLinks.some((link) => link._id === activity._id) ||
				activity.status === "DROPPED"
			) {
				continue;
			}

			const activityDue = new Date(formatDate(activity.due));
			if (activityDue >= startDate) {
				continue;
			}

			availableActivities.push(activity);
		}

		this.avaiableActivities = availableActivities.map((activity) => ({
			name: activity.summary,
			_id: activity._id
		}));
	}

	// Funzione per aggiungere un item alla lista di link assegnati
	private addSelectedLink(item: PartialLink) {
		const list = this.querySelector("#linkList");
		if (!list) return;

		if (this.selectedLinks.length === 0) {
			list.innerHTML =
				'<p class="text-muted">Nessuna attività associata</p>';
			return;
		}

		// Aggiungiamo l'evento per l'eliminazione dell'elemento
		const deleteCallback = (e: any) => {
			const clickedElement = e.target as HTMLElement;
			const itemElement = clickedElement.closest(".entry-item");
			itemElement?.remove();
			// Eliminiamo l'elemento dalla lista
			this.selectedLinks = this.selectedLinks.filter(
				(link) => link._id !== item._id
			);
			// Aggiorniamo la lista delle attivitá disponibili
			this.avaiableActivities.push(item);
			this.populateAvailableLinks();

			// If no links remain, show the message
			if (this.selectedLinks.length === 0) {
				list.innerHTML =
					'<div id="noLinks">Nessuna attività associata</div>';
			}
		};
		const linkBlock = createLinkEntry(item.name, "", true, deleteCallback);

		// Se non ci sono elementi nella lista, rimuoviamo il messaggio
		if (list.querySelector("#noLinks")) {
			list.innerHTML = "";
		}

		list.appendChild(linkBlock);
	}

	private async handleSave(e: Event) {
		e.preventDefault();

		const body = {
			prevIds: this.selectedLinks.map((link) => link._id),
			nextId: this.activity._id
		};

		const response = await safeFetch(
			fetch("/api/project/activity/link", {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify(body)
			})
		);

		if (!response.ok) {
			toast.error("Errore nell'associazione delle attività");
			return;
		}

		const viewToggler = document.querySelector(
			"view-toggler"
		) as ViewToggler | null;
		if (viewToggler) {
			await viewToggler.updatePage();
		} else {
			window.location.reload();
		}
	}

	private setupEventListeners() {
		const btn = this.querySelector("#addLinkBtn");
		const avaiableLinks = this.querySelector(
			"#avaiableLinks"
		) as HTMLSelectElement;

		// Aggiungiamo gli elementi giá linkati
		for (const link of this.selectedLinks) {
			this.addSelectedLink(link);
		}
		if (this.selectedLinks.length === 0) {
			const list = this.querySelector("#linkList");
			if (list) {
				list.innerHTML =
					'<div id="noLinks">Nessuna attività associata</div>';
			}
		}
		// Aggiungiamo gli elementi disponibili
		this.populateAvailableLinks();

		// Bottone per l'aggiunta di un nuovo link
		btn?.addEventListener("click", () => {
			const selectedOption =
				avaiableLinks.options[avaiableLinks.selectedIndex];
			const value = selectedOption?.value;
			const name = selectedOption?.textContent;

			if (!value) return;
			// Rimuoviamo l'elemento dalla lista delle attivitá disponibili
			this.avaiableActivities = this.avaiableActivities.filter(
				(activity) => activity._id !== value
			);

			// Aggiungiamo l'elemento alla lista dei link selezionati
			const newItem: PartialLink = { name: name || value, _id: value };
			this.selectedLinks.push(newItem);
			this.addSelectedLink(newItem);

			this.populateAvailableLinks();
			avaiableLinks.selectedIndex = 0;
		});

		const form = this.querySelector("#modifyLinkForm");
		form?.addEventListener("submit", (e) => this.handleSave(e));
	}

	private render() {
		this.innerHTML = `
            <div class="modal-header">
                <h5 class="modal-title">
                    <i class="bi bi-link"></i>
                    <span>Associa Attività</span>
                </h5>
                <div class="ms-auto d-flex align-items-center">
                    <button type="button" class="btn btn-sm btn-warning me-2" id="toggleEditBtn">
                        <i class="bi bi-x"></i>
						Annulla
                    </button>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
            </div>
            <form id="modifyLinkForm">
				<div class="modal-body">
					<div class="mb-4">
						<h4 class="mb-3 text-break">${escapeHTML(this.activity.summary)}</h4>
						<label class="form-label fw-semibold">Associa</label>
						<div class="add-link-form">
							<div class="input-group mb-3">
								<select class="form-select" id="avaiableLinks">
								</select>
								<button class="btn btn-primary" type="button" id="addLinkBtn">
									<i class="bi bi-plus-lg"></i>
								</button>
							</div>
						</div>
						<div class="user-list" id="linkList">
						</div>
					</div>
				</div>
				<div class="modal-footer">
					<button type="submit" class="btn btn-primary">Salva</button>
				</div>
			</form>
        `;
	}

	public initialize(
		activity: ProjectActivityResponse,
		activitiesList: ProjectActivityResponse[],
		selectedLinks: PartialLink[]
	) {
		this.activity = activity;
		this.activitiesList = activitiesList;
		this.selectedLinks = selectedLinks;
		this.getAvailableActivities();
		this.render();
		this.setupEventListeners();
	}
}

customElements.define("activity-link-form", ActivityLinkForm);

class ActivityDeleteForm extends HTMLElement {
	activity: ProjectActivityResponse;

	constructor() {
		super();
		this.activity = {} as ProjectActivityResponse;
	}

	async handleDelete() {
		const body = {
			_id: this.activity._id
		};

		const response = await safeFetch(
			fetch("/api/project/activity/delete", {
				method: "DELETE",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify(body)
			})
		);

		if (!response.ok) {
			toast.error("Errore durante l'eliminazione dell'attività");
			return;
		}

		const viewToggler = document.querySelector(
			"view-toggler"
		) as ViewToggler | null;
		if (viewToggler) {
			await viewToggler.updatePage();
			const modal = document.querySelector(
				"#ModifyActivity"
			) as HTMLDivElement;
			hideModal(modal);
		} else {
			window.location.reload();
		}
	}

	private setUpEventListeners() {
		const confirmBtn = this.querySelector("#confirmDeleteBtn");

		confirmBtn?.addEventListener("click", () => this.handleDelete());
	}

	private render() {
		this.innerHTML = `
            <div class="modal-header">
                <h5 class="modal-title text-danger">
                    <i class="bi bi-exclamation-triangle-fill"></i>
                    <span>Elimina Attività</span>
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
                <p class="fs-5">Sei sicuro di voler eliminare l'attività?</p>
                <p class="text-danger">Questa operazione non può essere annullata!</p>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-danger" id="confirmDeleteBtn">Elimina Attività</button>
            </div>
        `;
	}

	public initialize(activity: ProjectActivityResponse) {
		this.activity = activity;
		this.render();
		this.setUpEventListeners();
	}
}

customElements.define("activity-delete-form", ActivityDeleteForm);

class ActivityModifyForm extends HTMLElement {
	activity: ProjectActivityResponse;
	parentPhase: PhaseResponse | SubPhaseResponse;
	usersAvailable: User[];
	modifiedUserlist: User[];
	minDate: string;
	maxDate: string;

	constructor() {
		super();
		this.activity = {} as ProjectActivityResponse;
		this.parentPhase = {} as PhaseResponse;
		this.usersAvailable = [];
		this.modifiedUserlist = [];
		this.minDate = "";
		this.maxDate = "";
	}

	private async handleSubmit(event: Event) {
		event.preventDefault();
		const form = event.target as HTMLFormElement;
		const formData = new FormData(form);

		const summary = formData.get("summary") as string;
		const summaryInput = this.querySelector("#summary") as HTMLInputElement;

		clearError(summaryInput);

		if (!validateLength(summary, 3, 50)) {
			showError(
				summaryInput,
				"Il titolo deve essere lungo tra 3 e 50 caratteri"
			);
			return;
		}

		const data: any = {
			_id: this.activity._id,
			summary: summary,
			description: formData.get("description") as string,
			dtStart: formatStartDate(formData.get("dtStart") as string),
			due: formatDueDate(formData.get("due") as string),
			usernameList: this.modifiedUserlist.map((user) => user.name)
		};

		const response = await safeFetch(
			fetch("/api/project/activity/modify", {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify(data)
			})
		);

		if (!response.ok) {
			toast.error("Errore durante la modifica dell'attività");
			return;
		}

		const viewToggler = document.querySelector(
			"view-toggler"
		) as ViewToggler | null;
		if (viewToggler) {
			await viewToggler.updatePage();
		} else {
			window.location.reload();
		}
	}

	private createUsersSelect() {
		const availableUsers = this.usersAvailable.filter(
			(user) =>
				!this.modifiedUserlist.some(
					(modifiedUser) => modifiedUser.id === user.id
				)
		);
		const text =
			availableUsers.length > 0
				? "Seleziona un utente..."
				: "Nessun utente disponibile";

		let block = `<option value="" disabled selected>${text}</option>`;
		for (const user of availableUsers) {
			block += `
                <option value="${user.name}">${escapeHTML(user.name)}</option>
            `;
		}
		return block;
	}

	private updateUsersSelect(user: User, action: "ADD" | "REMOVE") {
		const select = this.querySelector("#newUser") as HTMLSelectElement;
		if (!select) return;

		if (action === "ADD") {
			if (select.options.length === 1) {
				select.innerHTML =
					"<option value='' disabled selected>Seleziona un utente</option>";
			}
			select.innerHTML += `<option value="${user.name}">${escapeHTML(user.name)}</option>`;
		} else {
			select.querySelectorAll("option").forEach((option) => {
				if (option.value === user.name) {
					option.remove();
				}
			});

			if (select.options.length === 1) {
				select.innerHTML =
					'<option value="" disabled selected>Nessun utente disponibile</option>';
			}
		}
	}

	private createForm() {
		return `
			<div class="modal-body">
				<div class="mb-4">
					<div class="row g-3 align-items-end">
						<div class="col">
						<label for="summary" class="form-label fw-semibold">Titolo</label>
							<input type="text" class="form-control" id="summary" name="summary" autocomplete="off"
								placeholder="Inserisci titolo attività" required value="${this.activity.summary}">
						</div>
					</div>
				</div>
				
				<div class="mb-4">
					<label for="description" class="form-label fw-semibold">Descrizione</label>
					<textarea class="form-control" id="description" name="description" 
						  rows="3" placeholder="Aggiungi una descrizione...">${this.activity.description || ""}</textarea>
				</div>

				<div class="mb-4 row">
					<div class="col-md-6">
						<label for="dtStart" class="form-label fw-semibold">Data d'inizio</label>
						<input type="date" class="form-control" id="dtStart" name="dtStart" 
						   required value="${formatDate(this.activity.dtStart)}"
						   min="${this.minDate}" 
						   max="${this.maxDate}">
					</div>
					<div class="col-md-6">
						<label for="due" class="form-label fw-semibold">Data di fine</label>
						<input type="date" class="form-control" id="due" name="due" 
						   required value="${formatDate(this.activity.due)}"
						   min="${this.minDate}" 
						   max="${this.maxDate}">
					</div>
				</div>

				<div class="mb-4">
					<label class="form-label fw-semibold">Utenti assegnati</label>
					<div class="add-user-form">
						<div class="input-group">
							<select class="form-select" id="newUser">
								${this.createUsersSelect()}
							</select>
							<button class="btn btn-primary" type="button" id="addUserBtn">
								<i class="bi bi-plus-lg"></i>
							</button>
						</div>
					</div>
					<div class="user-list mt-3" id="userList"></div>
				</div>
			</div>
			<div class="modal-footer">
				<button type="submit" class="btn btn-primary">Salva</button>
			</div>
		`;
	}

	// Aggiunge un utente alla lista
	private addUser(user: User) {
		const list = this.querySelector("#userList");
		if (!list) return;

		const deleteCallback = (e: any) => {
			const clickedElement = e.target as HTMLElement;
			const itemElement = clickedElement.closest(".entry-item");
			itemElement?.remove();

			// Troviamo l'utente nella lista modificata e lo rimuoviamo
			const removedUser = this.modifiedUserlist.find(
				(u) => u.name === user.name
			);
			this.modifiedUserlist = this.modifiedUserlist.filter(
				(u) => u.name !== user.name
			);
			if (removedUser) {
				this.usersAvailable.push(removedUser);
			}
			if (this.modifiedUserlist.length === 0) {
				list.innerHTML =
					'<p class="text-muted">Nessun utente assegnato</p>';
			}
			this.updateUsersSelect(user, "ADD");
		};

		const userBlock = createUserEntry(user, true, deleteCallback);

		list.appendChild(userBlock);
	}

	// Funzione per l'aggiunta e l'eliminazione degli utenti
	private setupItemManagement() {
		const btn = this.querySelector("#addUserBtn");
		const newUser = this.querySelector("#newUser") as HTMLSelectElement;

		for (const user of this.modifiedUserlist) {
			this.addUser(user);
		}

		if (this.modifiedUserlist.length === 0) {
			const userList = this.querySelector("#userList");
			if (userList) {
				userList.innerHTML =
					'<p class="text-muted">Nessun utente assegnato</p>';
			}
		}

		// Bottone per l'aggiunta di un nuovo utente
		btn?.addEventListener("click", () => {
			const name = newUser.value;
			if (!name) return;

			if (this.modifiedUserlist.length === 0) {
				const userList = this.querySelector("#userList");
				if (userList) {
					userList.innerHTML = "";
				}
			}

			const selectedUser = this.usersAvailable.find(
				(user) => user.name === name
			);
			if (!selectedUser) return;
			this.updateUsersSelect(selectedUser, "REMOVE");
			this.modifiedUserlist.push(selectedUser);
			this.addUser(selectedUser);
			newUser.value = "";
		});

		const form = this.querySelector("#modifyActivityForm");
		form?.addEventListener("submit", (e) => this.handleSubmit(e));
	}

	render() {
		this.innerHTML = `
            <div class="modal-header">
                <h5 class="modal-title">
                    <i class="bi bi-pencil-fill"></i>
                    <span>Modifica Attività</span>
                </h5>
                <div class="ms-auto d-flex align-items-center">
                    <button type="button" class="btn btn-sm btn-warning me-2" id="toggleEditBtn">
                        <i class="bi bi-x"></i>
                        Annulla
                    </button>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
            </div>
            <form id="modifyActivityForm">${this.createForm()}</form>
        `;
	}

	addDays(dateStr: string, num: number): string {
		const date = new Date(dateStr);
		date.setDate(date.getDate() + num);
		return date.toISOString();
	}

	calculateMinAndMaxDate() {
		this.minDate = formatDate(this.parentPhase.dtStart);
		this.maxDate = formatDate(this.parentPhase.due);

		if (this.activity.prevMaxDue) {
			const correctPrevMaxDue = this.addDays(this.activity.prevMaxDue, 1);
			if (correctPrevMaxDue > this.minDate) {
				this.minDate = formatDate(correctPrevMaxDue);
			}
		}

		if (this.activity.nextMinStart) {
			const correctNextMinStart = this.addDays(
				this.activity.nextMinStart,
				-1
			);
			if (correctNextMinStart < this.maxDate) {
				this.maxDate = formatDate(correctNextMinStart);
			}
		}
	}

	public initialize(
		activity: ProjectActivityResponse,
		parentPhase: PhaseResponse | SubPhaseResponse,
		usersList: User[],
		usersAvailable: User[]
	) {
		this.activity = activity;
		this.parentPhase = parentPhase;
		this.modifiedUserlist = [...usersList];
		this.usersAvailable = [...usersAvailable];
		this.calculateMinAndMaxDate();
		this.render();
		this.setupItemManagement();
	}
}

customElements.define("activity-modify-form", ActivityModifyForm);

// Funzione per aggiungere i dati al modale dell'Activity
export function openActivityForm(
	data: ProjectActivityResponse,
	parentData: SubPhaseResponse | PhaseResponse
) {
	const modifyModal = document.getElementById(
		"ModifyActivityComponent"
	) as ActivityForm | null;
	if (!modifyModal) {
		return;
	}
	modifyModal.updateData(data, parentData);
}
