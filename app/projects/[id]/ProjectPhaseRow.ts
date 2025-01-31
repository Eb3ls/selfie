import * as CONST from "./constants";

class ProjectPhaseRow extends HTMLElement {
	constructor() {
		super();
	}

	static get observedAttributes() {
		return ["data"];
	}

	attributeChangedCallback(name: string, _oldValue: any, newValue: any) {
		if (name === "data") {
			try {
				if (!newValue || newValue === "[]") {
					return;
				}
				const data = JSON.parse(newValue);
				this.render(data);
			} catch (error) {
				console.error("Errore nel parsing dei dati:", error);
			}
		}
	}

	handleRow(summary: string) {
		const row = document.createElement("div");
		row.className = "z-0";
		row.style.height = `${CONST.ROW_HEIGHT_PX}`;
		row.style.display = "grid";
		row.style.gridTemplateColumns = `repeat(${CONST.COL_NUM}, ${CONST.CELL_WIDTH_PX})`;
		row.style.gap = "0";
		row.style.width = CONST.CELL_WIDTH * CONST.COL_NUM + "px";

		const fragment = document.createDocumentFragment();

		// Crea le 15 colonne con un bordo grigio
		for (let i = 1; i <= CONST.COL_NUM; i++) {
			const cell = document.createElement("div");
			cell.style.borderBottom = "1px solid grey";
			cell.style.borderRight = "1px solid grey";

			if (i === Math.floor(CONST.COL_NUM / 2) + 1) {
				const phaseBlock = document.createElement("div");
				phaseBlock.style.gridColumn = "span 1"; // Estendi su 4 colonne (6-9)
				phaseBlock.style.backgroundColor = "#ffcccc";
				phaseBlock.style.color = "white";
				phaseBlock.style.borderRight = "1px solid grey";
				phaseBlock.style.borderBottom = "1px solid grey";
				phaseBlock.style.padding = "0";
				phaseBlock.className =
					"d-flex justify-content-center align-items-center";
				phaseBlock.innerText = summary;
				fragment.appendChild(phaseBlock);
			} else {
				fragment.appendChild(cell);
			}
		}
		row.appendChild(fragment);

		return row;
	}

	renderPhaseRow(data: any) {
		// Row per la fase
		const phaseRow = this.handleRow(data.summary);

		// Contenitore per il collapse con lo stesso id per fare il toggle di tutti
		const collapse = document.createElement("div");
		collapse.id = `collapse${data._id}`;
		collapse.className = "collapse";
		collapse.style.width = CONST.CELL_WIDTH * CONST.COL_NUM + "px";

		// Gestione delle sottofasi
		if (data.subPhases && data.subPhases.length > 0) {
			for (const subPhase of data.subPhases) {
				collapse.innerHTML += this.renderPhaseRow(subPhase);
			}
		}

		//Gestione delle attività
		if (data.activities && data.activities.length > 0) {
			for (const activity of data.activities) {
				const activityElement = this.handleRow(activity.summary);
				collapse.appendChild(activityElement);
			}
		}

		return phaseRow.outerHTML + collapse.outerHTML;
	}

	render(data: any){
		const container = document.createElement("div");
		container.className = "container";

		for (const phase of data) {
			const phaseElement = document.createElement("div");
			phaseElement.className = "row";
			phaseElement.innerHTML = this.renderPhaseRow(phase);
			container.appendChild(phaseElement);
		}

		this.innerHTML = "";
		this.appendChild(container);
	}
}

customElements.define("project-phase-row", ProjectPhaseRow);

export default ProjectPhaseRow;
