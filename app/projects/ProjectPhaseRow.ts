import * as CONST from "./constants";

class ProjectPhaseRow extends HTMLElement {
	constructor() {
		super();
	}

	static get observedAttributes() {
		return ["data"];
	}

	attributeChangedCallback(name: string, oldValue: string, newValue: string) {
		if (name === "data") {
			try {
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

	render(data: any) {
		// Row per la fase
		const phaseRow = this.handleRow(data.summary);

		// Contenitore per il collapse con lo stesso id per fare il toggle di tutti
		const collapse = document.createElement("div");
		collapse.id = `collapse${data.id}`;
		collapse.className = "collapse";
		collapse.style.width = CONST.CELL_WIDTH * CONST.COL_NUM + "px";

		// Gestione delle sottofasi
		if (data.subPhases) {
			for (const subPhase of data.subPhases) {
				const subPhaseElement =
					document.createElement("project-phase-row");
				subPhaseElement.setAttribute("data", JSON.stringify(subPhase));
				collapse.appendChild(subPhaseElement);
			}
		}

		//Gestione delle attività
		if (data.activities) {
			for (const activity of data.activities) {
				const activityElement = this.handleRow(activity.summary);
				collapse.appendChild(activityElement);
			}
		}

		this.innerHTML = phaseRow.outerHTML + collapse.outerHTML;
	}
}

customElements.define("project-phase-row", ProjectPhaseRow);

export default ProjectPhaseRow;
