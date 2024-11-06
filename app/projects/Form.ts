import * as CONST from "./constants";

class Form extends HTMLElement {
	constructor() {
		super();
	}

	connectedCallback() {
		this.render();
	}

	render() {
		const phaseHTML = `
			<div class="mb-3">
				<label for="Title" class="form-label">Title</label>
				<input type="text" class="form-control" id="Title" aria-describedby="Title">
			</div>
			<div class="mb-3 d-flex justify-content-between">
				<div>
					<label for="Start" class="form-label">Start</label>
					<input type="date" class="form-control" id="Start">
				</div>
				<div>
					<label for="Due" class="form-label">Due</label>
					<input type="date" class="form-control" id="Due">
				</div>
			</div>
		`;

		const subphaseHTML = `
			<div class="mb-3">
				<label for="MainPhase" class="form-label">Main Phase</label>
				<select class="form-select" id="MainPhase">
					<option selected>Choose...</option>
					<option value="1">Phase 1</option>
					<option value="2">Phase 2</option>
					<option value="3">Phase 3</option>
				</select>
			</div>
			<div class="mb-3">
				<label for="Title" class="form-label">Title</label>
				<input type="text" class="form-control" id="Title" aria-describedby="Title">
			</div>
			<div class="mb-3 d-flex justify-content-between">
				<div>
					<label for="Start" class="form-label">Start</label>
					<input type="date" class="form-control" id="Start">
				</div>
				<div>
					<label for="Due" class="form-label">Due</label>
					<input type="date" class="form-control" id="Due">
				</div>
			</div>
		`;

		const groupListHTML = `
			<label for="Category" class="form-label">Category</label>
			<div class="input-group mb-3">
				<input type="text" class="form-control" id="Category" aria-describedby="Category">
				<button class="btn btn-outline-secondary" type="button" id="button-category">Add</button>
			</div>
			<label for="Users" class="form-label">Assigned Users</label>
			<div class="input-group mb-3">
				<input type="text" class="form-control" id="Users" aria-describedby="Users">
				<button class="btn btn-outline-secondary" type="button" id="button-user">Add</button>
			</div>
			<label for="InputActivity" class="form-label">Input</label>
			<div class="input-group mb-3">
				<input type="text" class="form-control" id="InputActivity" aria-describedby="Users">
				<button class="btn btn-outline-secondary" type="button" id="button-input">Add</button>
			</div>
			<label for="OutputActivity" class="form-label">Output</label>
			<div class="input-group mb-3">
				<input type="text" class="form-control" id="OutputActivity" aria-describedby="Users">
				<button class="btn btn-outline-secondary" type="button" id="button-output">Add</button>
			</div>
		`;

		const activityHTML = `
			<div class="mb-3">
				<label for="MainPhase" class="form-label">Main Phase</label>
				<select class="form-select" id="MainPhase">
					<option selected>Choose...</option>
					<option value="1">Phase 1</option>
					<option value="2">Phase 2</option>
					<option value="3">Phase 3</option>
				</select>
			</div>
			<div class="mb-3">
				<label for="SubPhase" class="form-label">Sub Phase</label>
				<select class="form-select" id="MainPhase">
					<option selected>Choose...</option>
					<option value="1">SubPhase 1</option>
					<option value="2">SubPhase 2</option>
					<option value="3">SubPhase 3</option>
				</select>
			</div>
			<div class="mb-3">
				<label for="Title" class="form-label">Title</label>
				<input type="text" class="form-control" id="Title" aria-describedby="Title">
			</div>
			<div class="mb-3">
				<label for="Summary" class="form-label">Summary</label>
				<textarea id="Summary" class="form-control" aria-describedby="Summary" cols="30" row="10"></textarea>
			</div>
			<div class="mb-5 d-flex justify-content-between">
				<div>
					<label for="Start" class="form-label">Start</label>
					<input type="date" class="form-control" id="Start">
				</div>
				<div>
					<label for="Due" class="form-label">Due</label>
					<input type="date" class="form-control" id="Due">
				</div>
			</div>
			<div class="mb-5 d-flex justify-content-center">
				<label for="MilestoneCheck" class="form-label me-3">Is Milestone?</label>
				<input type="checkbox" class="form-check" id="MilestoneCheck">
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
							<h5 class="modal-title">
								<nav>
									<div class="nav nav-tabs" id="nav-tab" role="tablist">
										<button class="nav-link active" id="phase-tab" data-bs-toggle="tab" data-bs-target="#phase-pane" type="button" role="tab" aria-controls="phase tab" aria-selected="true">Phase</button>
										<button class="nav-link" id="subphase-tab" data-bs-toggle="tab" data-bs-target="#subphase-pane" type="button" role="tab" aria-controls="subphase tab" aria-selected="false">SubPhase</button>
										<button class="nav-link" id="activity-tab" data-bs-toggle="tab" data-bs-target="#activity-pane" type="button" role="tab" aria-controls="activity tab" aria-selected="false">Activity</button>
									</div>
								</nav>
							</h5>
						</div>
						<div class="modal-body">
							<form>
								<div class="tab-content">
									<div class="tab-pane show active" id="phase-pane" role="tabpanel" aria-labelledby="phase-tab">
										${phaseHTML}
									</div>
									<div class="tab-pane" id="subphase-pane" role="tabpanel" aria-labelledby="subphase-tab">
										${subphaseHTML}
									</div>
									<div class="tab-pane" id="activity-pane" role="tabpanel" aria-labelledby="activity-tab">
										${activityHTML}
									</div>
								</div>
							</form>
						</div>
						<div class="modal-footer">
							<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
							<button type="button" class="btn btn-primary">Save changes</button>
						</div>
					</div>
				</div>
			</div>
		`;
	}
}

customElements.define("form-component", Form);
export default Form;
