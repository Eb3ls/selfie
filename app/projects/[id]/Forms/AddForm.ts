import {
	PhaseResponse,
	SubPhaseResponse
} from "@/app/api/(auth)/project/[id]/route";
import { safeFetch } from "@/utils/fetch/fetch";
import { toast } from "react-toastify";
import {
	User,
	checkDate,
	clearError,
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

class AddForm extends HTMLElement {
	projectId: string;
	avaiableUsers: User[];
	phaseList: PhaseResponse[];
	currentView: "PHASE" | "SUBPHASE" | "ACTIVITY";

	constructor() {
		super();
		this.projectId = "";
		this.avaiableUsers = [];
		this.phaseList = [];
		this.currentView = "PHASE";
	}

	public loadProjectData(
		id: string,
		phases: PhaseResponse[],
		avaiableUsers: User[]
	) {
		if (!id || !phases) return;
		this.projectId = id;
		this.avaiableUsers = avaiableUsers;
		this.phaseList = phases;
		this.render();
		this.setupEventListeners();
	}

	connectedCallback() {
		// AA
		this.innerHTML = `
			<button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#AddForm">
				Aggiungi
			</button>
			
			<div class="modal fade" id="AddForm" aria-labelledby="FormLabel" aria-hidden="true">
				<div class="modal-dialog modal-lg">
					<div class="modal-content">
						<div class="modal-header d-flex justify-content-between align-items-center">
							<h5 class="modal-title mb-0"></h5>
							<div class="btn-group" role="group" aria-label="Form type selection">
								<button class="btn btn-outline-primary" id="phase-tab">Fase</button>
								<button class="btn btn-outline-primary" id="subphase-tab">Sottofase</button>
								<button class="btn btn-outline-primary" id="activity-tab">Attività</button>
							</div>
						</div>
						<div class="modal-body"></div>
					</div>
				</div>
			</div>
		`;
	}

	private render() {
		const modalTitle = this.querySelector(".modal-title") as HTMLElement;
		const modalBody = this.querySelector(".modal-body") as HTMLElement;

		if (!modalTitle || !modalBody) return;

		if (this.currentView === "PHASE") {
			modalTitle.innerText = "Aggiungi nuova Fase";
			modalBody.innerHTML = "";
			const phaseForm = new AddPhaseForm();
			phaseForm.initialize(this.projectId);
			modalBody.appendChild(phaseForm);
			const phaseTab = this.querySelector(
				"#phase-tab"
			) as HTMLButtonElement;
			if (phaseTab) {
				phaseTab.classList.add("active");
			}
		} else if (this.currentView === "SUBPHASE") {
			modalTitle.innerText = "Aggiungi nuova Sottofase";
			modalBody.innerHTML = "";
			const subPhaseForm = new AddSubPhaseForm();
			subPhaseForm.initialize(this.projectId, this.phaseList);
			modalBody.appendChild(subPhaseForm);
			const subphaseTab = this.querySelector(
				"#subphase-tab"
			) as HTMLButtonElement;
			if (subphaseTab) {
				subphaseTab.classList.add("active");
			}
		} else if (this.currentView === "ACTIVITY") {
			modalTitle.innerText = "Aggiungi nuova Attività";
			modalBody.innerHTML = "";
			const activityForm = new AddActivityForm();
			activityForm.initialize(this.phaseList, this.avaiableUsers);
			modalBody.appendChild(activityForm);
			const activityTab = this.querySelector(
				"#activity-tab"
			) as HTMLButtonElement;
			if (activityTab) {
				activityTab.classList.add("active");
			}
		}
	}

	private setupEventListeners() {
		const phaseBtn = this.querySelector("#phase-tab") as HTMLButtonElement;
		const subphaseBtn = this.querySelector(
			"#subphase-tab"
		) as HTMLButtonElement;
		const activityBtn = this.querySelector(
			"#activity-tab"
		) as HTMLButtonElement;

		if (!phaseBtn || !subphaseBtn || !activityBtn) return;

		phaseBtn.addEventListener("click", () => {
			subphaseBtn.classList.remove("active");
			activityBtn.classList.remove("active");
			this.currentView = "PHASE";
			this.render();
		});

		subphaseBtn.addEventListener("click", () => {
			phaseBtn.classList.remove("active");
			activityBtn.classList.remove("active");
			this.currentView = "SUBPHASE";
			this.render();
		});

		activityBtn.addEventListener("click", () => {
			phaseBtn.classList.remove("active");
			subphaseBtn.classList.remove("active");
			this.currentView = "ACTIVITY";
			this.render();
		});
	}
}

customElements.define("add-form-component", AddForm);

export default AddForm;

class AddPhaseForm extends HTMLElement {
	projectId: string;

	constructor() {
		super();
		this.projectId = "";
	}

	public initialize(id: string) {
		if (!id) return;
		this.projectId = id;
		this.render();
		this.setupEventListeners();
	}

	// Funzione per gestire la submit del form per l'aggiunta di una fase
	private async handleSubmit(event: Event) {
		event.preventDefault();
		const form = event.target as HTMLFormElement;
		const formData = new FormData(form);
		const data = Object.fromEntries(formData.entries());

		const titleBlock = this.querySelector("#Title") as HTMLInputElement;

		clearError(titleBlock);
		if (!validateLength(titleBlock.value, 3, 50)) {
			showError(
				titleBlock,
				"Il titolo deve essere lungo tra 3 e 50 caratteri"
			);
			return;
		}

		const body = {
			summary: data.Title,
			projectId: this.projectId,
			parentId: this.projectId,
			dtStart: formatStartDate(data.Start.toString()),
			due: formatDueDate(data.Due.toString())
		};

		const response = await safeFetch(
			fetch("/api/project/phase/add", {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify(body)
			})
		);

		if (!response.ok) {
			toast.error("Errore nella creazione della fase");
			return;
		}

		const viewToggler = document.querySelector(
			"view-toggler"
		) as ViewToggler | null;
		if (viewToggler) {
			await viewToggler.updatePage();
			const modal = document.querySelector("#AddForm") as HTMLElement;
			hideModal(modal);
		} else {
			window.location.reload();
		}
	}

	render() {
		this.innerHTML = `
			<form id="phaseForm">
				<div class="modal-body">
					<div class="mb-4">
						<label for="Title" class="form-label fw-semibold">Titolo</label>
						<input type="text" required name="Title" class="form-control" id="Title" autocomplete="off">
					</div>
					<div class="mb-4 row">
						<div class="col-md-6">
							<label for="Start" class="form-label fw-semibold">Data d'inizio</label>
							<input type="date" class="form-control" id="Start" name="Start" required>
						</div>
						<div class="col-md-6">
							<label for="Due" class="form-label fw-semibold">Data di fine</label>
							<input type="date" class="form-control" id="Due" name="Due" required>
						</div>
					</div>
				</div>
				<div class="modal-footer">
					<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Chiudi</button>
					<button type="submit" class="btn btn-primary">Aggiungi</button>
				</div>
			</form>
		`;
	}

	private setupEventListeners() {
		const form = this.querySelector("#phaseForm") as HTMLFormElement;
		form.addEventListener("submit", (event) => this.handleSubmit(event));
	}
}

customElements.define("add-phase-form", AddPhaseForm);

class AddSubPhaseForm extends HTMLElement {
	projectId: string;
	phaseList: PhaseResponse[];

	constructor() {
		super();
		this.projectId = "";
		this.phaseList = [];
	}

	public initialize(projectId: string, phaseList: PhaseResponse[]) {
		if (!projectId || !phaseList) return;
		this.projectId = projectId;
		this.phaseList = this.filterPhases(phaseList);
		this.render();
		this.setupEventListeners();
	}

	// Funzione per gestire la submit del form per l'aggiunta di una sottofase
	async handleSubmit(event: Event) {
		event.preventDefault();
		const form = event.target as HTMLFormElement;
		const formData = new FormData(form);
		const data = Object.fromEntries(formData.entries());

		const titleBlock = this.querySelector("#Title") as HTMLInputElement;

		clearError(titleBlock);
		if (!validateLength(titleBlock.value, 3, 50)) {
			showError(
				titleBlock,
				"Il titolo deve essere lungo tra 3 e 50 caratteri"
			);
			return;
		}

		const body = {
			summary: data.Title,
			projectId: this.projectId,
			parentId: data.Phase,
			dtStart: formatStartDate(data.Start.toString()),
			due: formatDueDate(data.Due.toString())
		};

		const response = await safeFetch(
			fetch("/api/project/phase/add", {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify(body)
			})
		);

		if (!response.ok) {
			toast.error("Errore nella creazione della sottofase");
			return;
		}

		const viewToggler = document.querySelector(
			"view-toggler"
		) as ViewToggler | null;
		if (viewToggler) {
			await viewToggler.updatePage();
			const modal = document.querySelector("#AddForm") as HTMLElement;
			hideModal(modal);
		} else {
			window.location.reload();
		}
	}

	private filterPhases(phaseList: PhaseResponse[]): PhaseResponse[] {
		return phaseList.filter((phase) => {
			// Se ci sono attivitá nella fase la saltiamo
			if (phase.activities.length > 0) return false;
			return true;
		});
	}

	// Funzione per crearee la lista di fasi
	private createOptions(): string {
		let option = ``;
		if (!this.phaseList) return option;

		if (this.phaseList.length === 0) {
			option += `
				<option value="" disabled selected>
					Nessuna fase disponibile
				</option>
			`;
			return option;
		} else {
			option += `
				<option value="" disabled selected>
					Seleziona una fase
				</option>
			`;
		}

		this.phaseList.forEach((phase) => {
			option += `
				<option value="${phase._id}">
					${escapeHTML(phase.summary)}
				</option>
			`;
		});

		return option;
	}

	// Funzione per settare il min e max per gli input date in base ai limiti della fase
	private handlePhaseSelection(event: Event) {
		const select = event.target as HTMLSelectElement;
		const selectedOption = select.selectedOptions[0];
		if (selectedOption.value === "") return;

		const phase = this.phaseList.find(
			(phase: any) => phase._id === selectedOption.value
		);
		if (!phase) return;

		const startDate = formatDate(phase.dtStart);
		const dueDate = formatDate(phase.due);

		const startInput = this.querySelector("#Start") as HTMLInputElement;
		const dueInput = this.querySelector("#Due") as HTMLInputElement;

		if (startInput && dueInput) {
			startInput.min = startDate;
			startInput.max = dueDate;
			dueInput.min = startDate;
			dueInput.max = dueDate;
			// Reset dei valori se fuori range o vuoti
			if (!checkDate(startInput.value, startDate, dueDate)) {
				startInput.value = startDate;
			}
			if (!checkDate(dueInput.value, startDate, dueDate)) {
				dueInput.value = startDate;
			}
		}
	}

	private render() {
		this.innerHTML = `
			<form id="subphaseForm">
				<div class="modal-body">
					<div class="mb-4">
						<label for="Phase" class="form-label fw-semibold">Fase principale</label>
						<select name="Phase" class="form-select" id="Phase" required>
							${this.createOptions()}
						</select>
					</div>
					<div id="hiddenBody" style="display: none;">
						<div class="mb-4">
							<label for="Title" class="form-label fw-semibold">Titolo</label>
							<input type="text" required name="Title" class="form-control" id="Title" autocomplete="off">
						</div>
						<div class="mb-4 row">
							<div class="col-md-6">
								<label for="Start" class="form-label fw-semibold">Data d'inizio</label>
								<input type="date" class="form-control" id="Start" name="Start" required>
							</div>
							<div class="col-md-6">
								<label for="Due" class="form-label fw-semibold">Data di fine</label>
								<input type="date" class="form-control" id="Due" name="Due" required>
							</div>
						</div>
					</div>
				</div>
				<div class="modal-footer">
					<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Chiudi</button>
					<button type="submit" class="btn btn-primary">Aggiungi</button>
				</div>
			</form>
		`;
	}

	private setupEventListeners() {
		const form = this.querySelector("#subphaseForm") as HTMLFormElement;
		if (form) {
			form.addEventListener("submit", (event) =>
				this.handleSubmit(event)
			);
		}

		const phaseSelect = this.querySelector("#Phase") as HTMLSelectElement;
		const hiddenBody = this.querySelector("#hiddenBody") as HTMLElement;

		if (phaseSelect && hiddenBody) {
			phaseSelect.addEventListener("change", (e) => {
				this.handlePhaseSelection(e);
				if (phaseSelect.value) {
					hiddenBody.style.display = "block";
				} else {
					hiddenBody.style.display = "none";
				}
			});
		}
	}
}

customElements.define("add-subphase-form", AddSubPhaseForm);

class AddActivityForm extends HTMLElement {
	phaseList: PhaseResponse[];
	mainPhaseSelected: PhaseResponse | null;
	users: User[];
	avaiableUsers: User[];

	constructor() {
		super();
		this.phaseList = [];
		this.mainPhaseSelected = null;
		this.users = [];
		this.avaiableUsers = [];
	}

	public initialize(phaseList: PhaseResponse[], avaiableUsers: User[]) {
		if (!phaseList) return;
		this.phaseList = phaseList;
		this.avaiableUsers = avaiableUsers;
		this.render();
		this.setupEventListeners();
	}

	// Funzione per gestire la submit del form per le attività
	async handleSubmit(event: Event) {
		event.preventDefault();
		const form = event.target as HTMLFormElement;
		const formData = new FormData(form);
		const data = Object.fromEntries(formData.entries());

		const titleBlock = this.querySelector("#Title") as HTMLInputElement;

		clearError(titleBlock);
		if (!validateLength(titleBlock.value, 3, 50)) {
			showError(
				titleBlock,
				"Il titolo deve essere lungo tra 3 e 50 caratteri"
			);
			return;
		}

		const body = {
			summary: data.Title,
			description: data.Description,
			dtStart: formatStartDate(data.Start.toString()),
			due: formatDueDate(data.Due.toString()),
			isMilestone: data.isMilestone === "on",
			phaseId: data.SubPhase || data.MainPhase,
			usernameList: this.users.map((user) => user.name)
		};

		const response = await safeFetch(
			fetch("/api/project/activity/add", {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify(body)
			})
		);

		if (!response.ok) {
			toast.error("Errore nella creazione dell'attività");
			return;
		}

		const viewToggler = document.querySelector(
			"view-toggler"
		) as ViewToggler | null;
		if (viewToggler) {
			await viewToggler.updatePage();
			const modal = document.querySelector("#AddForm") as HTMLElement;
			hideModal(modal);
		} else {
			window.location.reload();
		}
	}

	// Funzione per creare le opzioni per i selettori della fase e sottofase
	private createOptions(forMainPhase: boolean): string {
		let phases: PhaseResponse[] | SubPhaseResponse[] = [];
		if (forMainPhase) {
			phases = this.phaseList;
		} else {
			phases = this.mainPhaseSelected?.subPhases || [];
		}

		let option = ``;

		if (phases.length === 0) {
			option += `
				<option value="" disabled selected>
					Nessuna fase disponibile
				</option>
			`;
			return option;
		} else {
			option += `
				<option value="" disabled selected>
					Seleziona una fase
				</option>
			`;
		}

		phases.forEach((phase) => {
			option += `
				<option value="${phase._id}">
					${escapeHTML(phase.summary)}
				</option>
			`;
		});

		return option;
	}

	// Funzione per aggiornare min e max per gli input date in base ai limiti della fase/sottofase
	private handleDateSelection(phase: PhaseResponse | SubPhaseResponse) {
		const startDate = formatDate(phase.dtStart);
		const dueDate = formatDate(phase.due);

		const startInput = this.querySelector("#Start") as HTMLInputElement;
		const dueInput = this.querySelector("#Due") as HTMLInputElement;

		if (startInput && dueInput) {
			startInput.min = startDate;
			startInput.max = dueDate;
			dueInput.min = startDate;
			dueInput.max = dueDate;
			// Reset dei valori se fuori range o vuoti
			if (!checkDate(startInput.value, startDate, dueDate)) {
				startInput.value = startDate;
			}
			if (!checkDate(dueInput.value, startDate, dueDate)) {
				dueInput.value = startDate;
			}
		}
	}

	// Funzione per gestire la selezione della fase principale
	private handlePhaseSelection(event: Event) {
		const select = event.target as HTMLSelectElement;
		const selectedOption = select.selectedOptions[0];
		const hiddenSubphase = this.querySelector(
			"#hiddenSubphase"
		) as HTMLElement;
		const hiddenBody = this.querySelector("#hiddenBody") as HTMLElement;
		if (!hiddenSubphase || !hiddenBody) return;
		if (selectedOption.value === "") {
			this.mainPhaseSelected = null;
			hiddenSubphase.style.display = "none";
			hiddenBody.style.display = "none";
			return;
		}

		const phase = this.phaseList.find(
			(phase) => phase._id === selectedOption.value
		);
		if (!phase) return;
		this.mainPhaseSelected = phase;

		// Se la fase non ha sottofasi o ha attivitá, nascondiamo il selettore sottofasi
		const subPhases = phase.subPhases;

		const subPhaseSelect = this.querySelector(
			"#SubPhase"
		) as HTMLSelectElement;
		if (!subPhaseSelect) return;
		if (subPhases.length === 0 || phase.activities.length > 0) {
			hiddenSubphase.style.display = "none";
			hiddenBody.style.display = "block";
			subPhaseSelect.required = false;
			this.handleDateSelection(phase);
			return;
		}

		// Altrimenti mostriamo il selettore sottofasi
		hiddenSubphase.style.display = "block";
		hiddenBody.style.display = "none";
		subPhaseSelect.required = true;
		subPhaseSelect.innerHTML = this.createOptions(false);
	}

	// Funzione per gestire la selezione della sottofase
	private handleSubPhaseSelection(event: Event) {
		const select = event.target as HTMLSelectElement;
		const selectedOption = select.selectedOptions[0];
		if (selectedOption.value === "" || !this.mainPhaseSelected) return;

		const phase = this.mainPhaseSelected?.subPhases.find(
			(subPhase) => subPhase._id === selectedOption.value
		);
		if (!phase) return;

		const hiddenBody = this.querySelector("#hiddenBody") as HTMLElement;
		if (hiddenBody) {
			hiddenBody.style.display = "block";
		}

		this.handleDateSelection(phase);
	}

	// Funzione per creare la lista degli utenti disponibili
	private createUsersSelect(): string {
		let option = ``;
		if (this.avaiableUsers.length === 0) {
			option += `
				<option value="" disabled selected>
					Nessun utente disponibile
				</option>
			`;
			return option;
		} else {
			option += `
				<option value="" disabled selected>
					Seleziona un utente
				</option>
			`;
		}

		this.avaiableUsers.forEach((user) => {
			option += `
				<option value="${user.name}">
					${escapeHTML(user.name)}
				</option>
			`;
		});

		return option;
	}

	// Funzione per aggiungere/rimuovere un utente alla lista
	private updateUsersSelect(user: string, action: "ADD" | "REMOVE") {
		const select = this.querySelector("#newUser") as HTMLSelectElement;
		if (!select) return;

		if (action === "ADD") {
			if (select.options.length === 1) {
				select.innerHTML =
					"<option value='' disabled selected>Seleziona un utente</option>";
			}
			select.innerHTML += `<option value="${user}">${escapeHTML(user)}</option>`;
		} else {
			select.querySelectorAll("option").forEach((option) => {
				if (option.value === user) {
					option.remove();
				}
			});

			if (select.options.length === 1) {
				select.innerHTML =
					'<option value="" disabled selected>Nessun utente disponibile</option>';
			}
		}
	}

	// Aggiunge un utente alla lista
	private addUser(user: User) {
		const list = this.querySelector("#userList");
		if (!list) return;

		const deleteCallback = (e: any) => {
			const clickedElement = e.target as HTMLElement;
			const itemElement = clickedElement.closest(".entry-item");
			itemElement?.remove();
			const removedUser = this.users.find((u) => u.name === user.name);
			this.users = this.users.filter((u) => u.name !== user.name);
			if (!removedUser) return;
			this.avaiableUsers.push(removedUser);
			if (this.users.length === 0) {
				list.innerHTML =
					'<p class="text-muted">Nessun utente assegnato</p>';
			}
			this.updateUsersSelect(user.name, "ADD");
		};

		const userBlock = createUserEntry(user, true, deleteCallback);

		list.appendChild(userBlock);
	}

	private render() {
		this.innerHTML = `
			<form id="activityForm" >
				<div class="modal-body">
					<div class="mb-3">
						<label for="MainPhase" class="form-label fw-semibold">Fase principale</label>
						<select name="MainPhase" class="form-select" id="MainPhase" required>
							${this.createOptions(true)}
						</select>
					</div>
					<div id="hiddenSubphase" class="mb-3" style="display: none;">
						<label for="SubPhase" class="form-label fw-semibold">Sottofase</label>
						<select required name="SubPhase" class="form-select" id="SubPhase">
						</select>
					</div>
					<div id="hiddenBody" style="display: none;">
						<div class="mb-4">
							<div class="row g-3 align-items-end">
								<div class="col">
								<label for="Title" class="form-label fw-semibold">Titolo</label>
								<div class="input-group">
									<input type="text" required name="Title" class="form-control" id="Title" autocomplete="off">
									<div class="input-group-text px-2 bg-white">
									<div class="form-check form-check-inline mb-0">
										<label for="MilestoneCheck" class="form-check-label me-1">
											Milestone <i class="bi bi-flag-fill text-primary"></i>
										</label>
										<input type="checkbox" name="isMilestone" class="form-check-input" id="MilestoneCheck">
									</div>
									</div>
								</div>
								</div>
							</div>
						</div>
						<div class="mb-4">
							<label for="Description" class="form-label fw-semibold">Descrizione</label>
							<textarea id="Description" name="Description" class="form-control" aria-describedby="Description" cols="30" row="10"></textarea>
						</div>
						<div class="mb-4 row">
							<div class="col-md-6">
								<label for="Start" class="form-label fw-semibold">Data d'inizio</label>
								<input type="date" class="form-control" id="Start" name="Start" required>
							</div>
							<div class="col-md-6">
								<label for="Due" class="form-label fw-semibold">Data di fine</label>
								<input type="date" class="form-control" id="Due" name="Due" required>
							</div>
						</div>
						<label class="form-label fw-bold">Utenti assegnati</label>
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
						<div class="user-list mt-3" id="userList">
							<p class="text-muted">Nessun utente assegnato</p>
						</div>
					</div>
				</div>
				<div class="modal-footer">
					<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Chiudi</button>
					<button type="submit" class="btn btn-primary">Aggiungi</button>
				</div>
			</form >
		`;
	}

	private setupEventListeners() {
		const form = this.querySelector("#activityForm") as HTMLFormElement;
		form.addEventListener("submit", (event) => this.handleSubmit(event));

		const mainPhaseSelect = this.querySelector(
			"#MainPhase"
		) as HTMLSelectElement;
		if (mainPhaseSelect) {
			mainPhaseSelect.addEventListener("change", (e) => {
				this.handlePhaseSelection(e);
			});
		}

		const subPhaseSelect = this.querySelector(
			"#SubPhase"
		) as HTMLSelectElement;
		if (subPhaseSelect) {
			subPhaseSelect.addEventListener("change", (e) => {
				this.handleSubPhaseSelection(e);
			});
		}

		const addUserBtn = this.querySelector(
			"#addUserBtn"
		) as HTMLButtonElement;
		const newUserSelect = this.querySelector(
			"#newUser"
		) as HTMLSelectElement;
		if (addUserBtn && newUserSelect) {
			addUserBtn.addEventListener("click", () => {
				const user = newUserSelect.value;
				if (!user) return;

				if (this.users.length === 0) {
					const userList = this.querySelector("#userList");
					if (userList) {
						userList.innerHTML = "";
					}
				}

				this.updateUsersSelect(user, "REMOVE");
				const newUser = this.avaiableUsers.find((u) => u.name === user);
				if (!newUser) return;
				this.users.push(newUser);
				this.addUser(newUser);
				newUserSelect.value = "";
			});
		}
	}
}

customElements.define("add-activity-form", AddActivityForm);
