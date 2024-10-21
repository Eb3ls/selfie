class ProjectPhase extends HTMLElement {
	constructor() {
		super();
		this.data = "";
	}

	static get observedAttributes() {
		return ["data"];
	}

	attributeChangedCallback(name, newValue) {
		if (name === "data") {
			this.data = newValue;
		}
		this.render();
	}

	render() {
		this.innerHTML = `
		<button class="btn btn-primary"
			type="button"
			data-bs-toggle="collapse"
			data-bs-target="#collapseWidthExample"
			aria-expanded="false"
			aria-controls="collapseWidthExample">
			Toggle with collapse
		</button>
		<div id="collapseWidthExample" class="collapse">
			<div>${this.data}</div>
		</div>
		`;
	}
}

customElements.define("project-phase", ProjectPhase);

export default ProjectPhase;
