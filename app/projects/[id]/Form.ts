import React from "react";
import { createRoot } from "react-dom/client";
import { RxReset } from "react-icons/rx";

class Form extends HTMLElement {
	projectID: string;

	constructor() {
		super();
		this.projectID = "";
	}

	connectedCallback() {
		this.projectID = window.location.pathname.split("/")[2];
		this.render();
	}

	async handlePhaseSubmit(event: Event, ref: HTMLFormElement[]) {
		event.preventDefault();
		const form = event.target as HTMLFormElement;
		const formData = new FormData(form);
		const data = Object.fromEntries(formData.entries());

		try{
			const result = await fetch("/api/project/phase/add", {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					summary: data.Title,
					projectId: this.projectID,
					parentId: this.projectID,
					dtStart: data.Start,
					due: data.Due
				})
			})

			if (result.ok) {
				alert("Phase added successfully");
				ref.forEach((form) => form.reset());
			} else {
				console.error(result);
				throw new Error("Failed to add phase");
			}
		} 
		catch (error) {
			console.error(error);
			alert("Failed to add phase");
		}
		
	}

	handleSubPhaseSubmit(event: Event, ref: HTMLFormElement[]) {
		event.preventDefault();
		const form = event.target as HTMLFormElement;
		const formData = new FormData(form);
		const data = Object.fromEntries(formData.entries());
		ref.forEach((form) => form.reset());
	}

	handleActivitySubmit(event: Event, ref: HTMLFormElement[]) {
		event.preventDefault();
		const form = event.target as HTMLFormElement;
		const formData = new FormData(form);
		const data = Object.fromEntries(formData.entries());
		ref.forEach((form) => form.reset());
	}

	render() {
		const Title = `
			<div class="mb-3">
				<label for="Title" class="form-label">Title</label>
				<input type="text" required name="Title" class="form-control" id="Title">
			</div>
		`;

		const StartDue = `
			<div>
				<label for="Start" class="form-label">Start</label>
				<input type="date" required name="Start" class="form-control" id="Start">
			</div>
			<div>
				<label for="Due" class="form-label">Due</label>
				<input type="date" required name="Due" class="form-control" id="Due">
			</div>
		`;

		// Primo form
		const phaseHTML = `
			${Title}
			<div class="mb-3 d-flex justify-content-between">
				${StartDue}
			</div>
		`;

		const mainPhase = `
			<div class="mb-3">
				<label for="MainPhase" class="form-label">Main Phase</label>
				<select required name="MainPhase" class="form-select" id="MainPhase">
					<option selected>Choose...</option>
					<option value="1">Phase 1</option>
					<option value="2">Phase 2</option>
					<option value="3">Phase 3</option>
				</select>
			</div>
		`;

		// Secondo form
		const subphaseHTML = `
			${Title}
			<div class="mb-3 d-flex justify-content-between">
				${StartDue}
			</div>
			${mainPhase}
		`;

		const groupListHTML = `
			<label for="Category" class="form-label">Category</label>
			<div class="input-group mb-3">
				<input type="text" name="Category" class="form-control" id="Category" aria-describedby="Category">
				<button class="btn btn-outline-secondary" type="button" id="button-category">Add</button>
			</div>
			<label for="Users" class="form-label">Assigned Users</label>
			<div class="input-group mb-3">
				<input type="text" name="Users" class="form-control" id="Users" aria-describedby="Users">
				<button class="btn btn-outline-secondary" type="button" id="button-user">Add</button>
			</div>
			<label for="InputActivity" class="form-label">Input</label>
			<div class="input-group mb-3">
				<input type="text" name="OutputActivity" class="form-control" id="InputActivity" aria-describedby="Users">
				<button class="btn btn-outline-secondary" type="button" id="button-input">Add</button>
			</div>
			<label for="OutputActivity" class="form-label">Output</label>
			<div class="input-group mb-3">
				<input type="text" name="OutputActivity" class="form-control" id="OutputActivity" aria-describedby="Users">
				<button class="btn btn-outline-secondary" type="button" id="button-output">Add</button>
			</div>
		`;

		// Terzo form
		const activityHTML = `
			${mainPhase}
			<div class="mb-3">
				<label for="SubPhase" class="form-label">Sub Phase</label>
				<select required name="SubPhase" class="form-select" id="MainPhase">
					<option selected>Choose...</option>
					<option value="1">SubPhase 1</option>
					<option value="2">SubPhase 2</option>
					<option value="3">SubPhase 3</option>
				</select>
			</div>
			${Title}
			<div class="mb-3">
				<label for="Summary" class="form-label">Summary</label>
				<textarea id="Summary" name="Summary" class="form-control" aria-describedby="Summary" cols="30" row="10"></textarea>
			</div>
			<div class="mb-5 d-flex justify-content-between">
				${StartDue}
			</div>
			<div class="mb-5 d-flex justify-content-center">
				<label for="MilestoneCheck" class="form-label me-3">Is Milestone?</label>
				<input type="checkbox" name="isMilestone" class="form-check" id="MilestoneCheck">
			</div>
			${groupListHTML}
		`;

		this.innerHTML = `
			<button type="button rounded-pill" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#Form">
				Add new
			</button>
			
			<div class="modal fade" id="Form" aria-labelledby="FormLabel" aria-hidden="true">
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
										<button type="submit" class="btn btn-primary" data-bs-dismiss="modal">Add</button>
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
										<button type="submit" class="btn btn-primary" data-bs-dismiss="modal">Add</button>
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
										<button type="submit" class="btn btn-primary" data-bs-dismiss="modal">Add</button>
									</div>
								</form >
							</div>
						</div>
					</div>
				</div>
			</div>
		`;

		const phaseForm: HTMLFormElement | null =
			this.querySelector("#phaseForm");
		const subphaseForm: HTMLFormElement | null =
			this.querySelector("#subphaseForm");
		const activityForm: HTMLFormElement | null =
			this.querySelector("#activityForm");

		const ref = new Array<HTMLFormElement>();
		ref.push(phaseForm!);
		ref.push(subphaseForm!);
		ref.push(activityForm!);

		phaseForm!.addEventListener("submit", (event) => {
			this.handlePhaseSubmit(event, ref);
		});
		subphaseForm!.addEventListener("submit", (event) => {
			this.handleSubPhaseSubmit(event, ref);
		});
		activityForm!.addEventListener("submit", (event) => {
			this.handleActivitySubmit(event, ref);
		});

		const clearBtn = this.querySelector("#ClearBtn");
		clearBtn!.addEventListener("click", () => {
			ref.forEach((form) => form.reset());
		});

		const root = createRoot(clearBtn!);
		root.render(React.createElement(RxReset, { size: 30 }));
	}
}

customElements.define("form-component", Form);
export default Form;
