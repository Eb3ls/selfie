import { fetcher, formatDate } from "../Utils";

class AddForm extends HTMLElement {
	projectID: string;
	projectData: any[];

	constructor() {
		super();
		this.projectID = "";
		this.projectData = [];	
	}

	public loadProjectData(id: string, phases: any) {
		if(!id || !phases) return;
		this.projectID = id;
		this.projectData = phases;
		this.render();
	}

	// Funzione per gestire la submit del form per l'aggiunta di una fase
	async handlePhaseSubmit(event: Event, ref: HTMLFormElement[]) {
		event.preventDefault();
		const form = event.target as HTMLFormElement;
		const formData = new FormData(form);
		const data = Object.fromEntries(formData.entries());

		const method = "POST";
		const url = "/api/project/phase/add";
		const body = {
			summary: data.Title,
			projectId: this.projectID,
			parentId: this.projectID,
			dtStart: new Date(data.Start + 'T00:00:00.000Z').toISOString(),
			due: new Date(data.Due + 'T23:59:59.999Z').toISOString()
		}

		try {
			await fetcher(method, url, body);
			window.location.reload();
		} catch (error) {
			console.error(error);
		}
	}

	// Funzione per gestire la submit del form per l'aggiunta di una sottofase
	async handleSubPhaseSubmit(event: Event, ref: HTMLFormElement[]) {
		event.preventDefault();
		const form = event.target as HTMLFormElement;
		const formData = new FormData(form);
		const data = Object.fromEntries(formData.entries());

		const method = "POST";
		const url = "/api/project/phase/add";
		const body = {
			summary: data.Title,
			projectId: this.projectID,
			parentId: data.MainPhase,
			dtStart: new Date(data.Start + 'T00:00:00.000Z').toISOString(),
			due: new Date(data.Due + 'T23:59:59.999Z').toISOString()
		}

		try {
			await fetcher(method, url, body);
			window.location.reload();
		} catch (error) {
			console.error(error);
		}
	}

	// Funzione per gestire la submit del form per le attività
	async handleActivitySubmit(event: Event, ref: HTMLFormElement[]) {
		event.preventDefault();
		const form = event.target as HTMLFormElement;
		const formData = new FormData(form);
		const data = Object.fromEntries(formData.entries());

		const method = "POST";
		const url = "/api/project/activity/add";
		const body = {
			summary: data.Title,
			description: data.Description,
			dtStart: new Date(data.Start+"T00:00:00.000Z").toISOString(),
			due: new Date(data.Due+"T23:59:59.999Z").toISOString(),
			isMilestone: data.isMilestone === "on",
			phaseId: data.SubPhase,
			usernameList: ["prova"]
		}

		try {
			await fetcher(method, url, body);
			window.location.reload();
		} catch (error) {
			console.error(error);
		}
	}

	// Controlliamo se la data é dentro i limiti della fase/sottofase
	private checkDate(date: string, start: string, due: string): boolean {
		const newDate = new Date(date);
		const startDate = new Date(start);
		const dueDate = new Date(due);

		if (newDate >= startDate && newDate <= dueDate) {
			return true;
		}
		return false;
	}

	// Imposta il min e max per gli input date in base ai limiti della fase/sottofase
	handleDateSelection(event: Event) {
        const select = event.target as HTMLSelectElement;
        const selectedOption = select.selectedOptions[0];
		if(selectedOption.value === '') return;
        const startDate = formatDate(selectedOption.dataset.start as string);
        const dueDate = formatDate(selectedOption.dataset.due as string);
        
        // Trova gli input date nel form corrente
        const form = select.closest('form');
        const startInput = form?.querySelector('input[name="Start"]') as HTMLInputElement;
        const dueInput = form?.querySelector('input[name="Due"]') as HTMLInputElement;
        
        if (startInput && dueInput && startDate && dueDate) {
            startInput.min = startDate;
            startInput.max = dueDate;
            dueInput.min = startDate;
            dueInput.max = dueDate;
			// Reset dei valori se fuori range o vuoti
			if (!this.checkDate(startInput.value, startDate, dueDate)) {
				startInput.value = startDate;
			}
			if (!this.checkDate(dueInput.value, startDate, dueDate)) {
				dueInput.value = startDate;
			}
        }
    }

	// Funzione per mostrare le sottofasi in base alla fase selezionata
	handleMainPhaseSelection(event: Event) {
		const select = event.target as HTMLSelectElement;
		const selectedOption = select.selectedOptions[0];
		if (selectedOption.value === '') return;
		
		const phaseIndex = this.projectData.findIndex((phase: any) => phase._id === selectedOption.value);
		const activityPane = document.querySelector('#activity-pane');
		
		if (!activityPane) return;
	
		const subPhaseSelect = activityPane.querySelector('select[name="SubPhase"]') as HTMLSelectElement;
		const subPhaseFields = activityPane.querySelector('#subPhaseSelectFields') as HTMLElement;
		const activityFields = activityPane.querySelector('#activityFields') as HTMLElement;
	
		if (this.projectData[phaseIndex].subPhases?.length > 0) {
			// Se ha sottofasi - mostra selettore sottofasi, nascondi campi attività
			if (subPhaseSelect) {
				subPhaseSelect.innerHTML = this.createOption(phaseIndex, true);
				if (!subPhaseSelect.parentElement) return;
				subPhaseSelect.parentElement.style.display = 'block';
			}
			if (activityFields) {
				activityFields.style.display = 'none';
			}
		} else {
			// Se non ha sottofasi - nascondi selettore sottofasi, mostra campi attività
			if (subPhaseSelect) {
				// Seleziona la fase come sottofase nascondendo il selettore
				subPhaseSelect.value = this.projectData[phaseIndex]._id;
				subPhaseSelect.innerHTML = `<option value="${this.projectData[phaseIndex]._id}">${this.projectData[phaseIndex].summary}</option>`;
				// Nascondi il selettore
				if(subPhaseSelect.parentElement){
					subPhaseSelect.parentElement.style.display = 'none';
				}
			}
			if (subPhaseFields) {
				subPhaseFields.style.display = 'block';
			}
			if (activityFields) {
				activityFields.style.display = 'block';
			}
		}
	}

	// Funzione per mostrare title e date solo dopo che si seleziona una fase
	showBlock(event: Event, id: string) {
		const select = event.target as HTMLSelectElement;
		const ref = document.getElementById(id);
		
		if (select.value && ref) {
			ref.style.display = 'block';
		}
		else if (ref) {
			ref.style.display = 'none';
		}
	}

	// Mostra la lista di fasi o sottofasi (index !== -1)
	createOption(phaseIndex: number, forAddingSubPhase: boolean): string {
		const name = phaseIndex === -1 ? "phase" : "sub phase";
		let option = `<option value=''>Select a ${name}...</option>`;
		if (this.projectData.length === 0) return option;

		if (phaseIndex === -1) {
			this.projectData.forEach((phase: any) => {
				// Se ci sono attivitá e dobbiamo aggiungere una sottofase, salta
				if (forAddingSubPhase && phase.activities.length > 0) return;
				// Se la fase è scaduta, salta
				if (new Date(phase.due) < new Date()) return;

				option += `<option value="${phase._id}" 
					data-start="${formatDate(phase.dtStart)}" 
					data-due="${formatDate(phase.due)}">
					${phase.summary}
				</option>`;
			});
		} else {
			const subPhases = this.projectData[phaseIndex].subPhases;
			subPhases.forEach((subPhase: any) => {
				// Se la sottofase è scaduta, salta
				if (new Date(subPhase.due) < new Date()) return;

				option += `<option value="${subPhase._id}" 
					data-start="${formatDate(subPhase.dtStart)}" 
					data-due="${formatDate(subPhase.due)}">
					${subPhase.summary}
				</option>`;
			});
		}
		return option;
	}

	Title = `
		<div class="mb-3">
			<label for="Title" class="form-label">Title</label>
			<input type="text" required name="Title" class="form-control" id="Title">
		</div>
	`;

	StartDue = `
		<div>
			<label for="Start" class="form-label">Start</label>
			<input type="date" required name="Start" class="form-control" id="Start">
		</div>
		<div>
			<label for="Due" class="form-label">Due</label>
			<input type="date" required name="Due" class="form-control" id="Due">
		</div>
	`;

	render() {
		// Primo form
		const phaseHTML = `
			${this.Title}
			<div class="mb-3 d-flex justify-content-between">
				${this.StartDue}
			</div>
		`;

		// Secondo form
		const subphaseHTML = `
			<div class="mb-3">
				<label for="MainPhase" class="form-label">Main Phase</label>
				<select name="MainPhase" class="form-select" id="MainPhase" required>
					${this.createOption(-1, true)}
				</select>
			</div>
			<div id="subPhaseFields" style="display: none;">
				${this.Title}
				<div class="mb-3 d-flex justify-content-between">
					${this.StartDue}
				</div>
			</div>
		`;

		const groupListHTML = `
			<label for="Users" class="form-label">Assigned Users</label>
			<div class="input-group mb-3">
				<input type="text" name="Users" class="form-control" id="Users" aria-describedby="Users">
				<button class="btn btn-outline-secondary" type="button" id="button-user">Add</button>
			</div>
		`;

		const activityHTML = `
			<div class="mb-3">
				<label for="MainPhase" class="form-label">Main Phase</label>
				<select name="MainPhase" class="form-select" id="MainPhase" required>
					${this.createOption(-1, false)}
				</select>
			</div>
			<div id="subPhaseSelectFields" style="display: none;">
				<div class="mb-3" style="display: block;">
					<label for="SubPhase" class="form-label">Sub Phase</label>
					<select required name="SubPhase" class="form-select" id="SubPhase">
					</select>
				</div>
				<div id="activityFields" style="display: none;">
					${this.Title}
					<div class="mb-3">
						<label for="Description" class="form-label">Description</label>
						<textarea id="Description" name="Description" class="form-control" aria-describedby="Description" cols="30" row="10"></textarea>
					</div>
					<div class="mb-5 d-flex justify-content-between">
						${this.StartDue}
					</div>
					<div class="mb-3 d-flex justify-content-center">
						<label for="MilestoneCheck" class="form-label me-3">Is Milestone?</label>
						<input type="checkbox" name="isMilestone" class="form-check" id="MilestoneCheck">
					</div>
					${groupListHTML}
				</div>
			</div>
		`;

		this.innerHTML = `
			<button type="button rounded-pill" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#AddForm">
				Add new
			</button>
			
			<div class="modal fade" id="AddForm" aria-labelledby="FormLabel" aria-hidden="true">
				<div class="modal-dialog">
					<div class="modal-content">
						<div class="modal-header">
							<div class="d-flex justify-content-between align-items-center flex-grow-1">
								<h5 class="modal-title">
									<nav>
										<div class="nav nav-tabs" id="nav-tab" role="tablist">
											<button class="nav-link active" id="phase-tab" data-bs-toggle="tab" data-bs-target="#phase-pane" type="button" role="tab" aria-controls="phase tab" aria-selected="true">Phase</button>
											<button class="nav-link" id="subphase-tab" data-bs-toggle="tab" data-bs-target="#subphase-pane" type="button" role="tab" aria-controls="subphase tab" aria-selected="false">SubPhase</button>
											<button class="nav-link" id="activity-tab" data-bs-toggle="tab" data-bs-target="#activity-pane" type="button" role="tab" aria-controls="activity tab" aria-selected="false">Activity</button>
										</div>
									</nav>
								</h5>
								<button type="link" id="ClearBtn" class="btn" aria-label="Clear">
								</button>
							</div>
						</div>
						<div class="tab-content">
							<div class="tab-pane show active" id="phase-pane" role="tabpanel" aria-labelledby="phase-tab">
								<form id="phaseForm">
									<div class="modal-body">
										${phaseHTML}
									</div>
									<div class="modal-footer">
										<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
										<button type="submit" class="btn btn-primary">Add</button>
									</div>
								</form >
							</div>
							<div class="tab-pane" id="subphase-pane" role="tabpanel" aria-labelledby="subphase-tab">
								<form id="subphaseForm">
									<div class="modal-body">
										${subphaseHTML}
									</div>
									<div class="modal-footer">
										<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
										<button type="submit" class="btn btn-primary">Add</button>
									</div>
								</form >
							</div>
							<div class="tab-pane" id="activity-pane" role="tabpanel" aria-labelledby="activity-tab">
								<form id="activityForm" >
									<div class="modal-body">
										${activityHTML}
									</div>
									<div class="modal-footer">
										<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
										<button type="submit" class="btn btn-primary">Add</button>
									</div>
								</form >
							</div>
						</div>
					</div>
				</div>
			</div>
		`;

		const phaseForm = this.querySelector("#phaseForm");
		const subphaseForm = this.querySelector("#subphaseForm");
		const activityForm = this.querySelector("#activityForm");
		const ref = [phaseForm, subphaseForm, activityForm].filter((form): form is HTMLFormElement => form !== null);

		phaseForm!.addEventListener("submit", (event) => {
			this.handlePhaseSubmit(event, ref);
		});
		subphaseForm!.addEventListener("submit", (event) => {
			this.handleSubPhaseSubmit(event, ref);
		});
		activityForm!.addEventListener("submit", (event) => {
			this.handleActivitySubmit(event, ref);
		});

		const subPhaseFields = this.querySelector("#subPhaseFields");
		const activityFields = this.querySelector("#activityFields");
		const subPhaseSelectFields = this.querySelector("#subPhaseSelectFields");
		// Array per nascondere i campi con il reset
		const forms = [subPhaseFields, activityFields, subPhaseSelectFields];

		const clearBtn = this.querySelector("#ClearBtn");
		clearBtn!.addEventListener("click", () => {
			ref.forEach((form) => form.reset());
			forms.forEach((form) => (form as HTMLElement)!.style.display = 'none');
		});

		clearBtn!.innerHTML = '<i class="bi bi-arrow-counterclockwise" style="font-size: 30px;"></i>';

		// Event listener per mostrare i campi del form solo dopo aver selezionato una fase e inserire min/max per le date
		const subPhaseSelect = this.querySelector('#subphase-pane select[name="MainPhase"]');
		if (subPhaseSelect) {
			subPhaseSelect.addEventListener('change', (e) => 
				{
					this.handleDateSelection(e);
					this.showBlock(e, 'subPhaseFields');
				}
			);
		}

		const firstActivitySelect = this.querySelector('#activity-pane select[name="MainPhase"]');
		if(firstActivitySelect){
			firstActivitySelect.addEventListener('change', (e) => 
				{
					this.handleMainPhaseSelection(e)
					this.handleDateSelection(e)
					this.showBlock(e, 'subPhaseSelectFields');
				});
		}

		const secondActivitySelect = this.querySelector('#SubPhase');
		if (secondActivitySelect) {
			secondActivitySelect.addEventListener('change', (e) => 
				{
					this.handleDateSelection(e)
					this.showBlock(e, 'activityFields');
				});
		}
	}
}

customElements.define("add-form-component", AddForm);

export default AddForm;
