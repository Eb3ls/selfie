import * as CONSTANT from "./constants";

class OnLoadFunctions extends HTMLElement {
	constructor() {
		super();
	}

	scrollToCenter() {
		const scrollDiv = document.getElementById("scrollDiv");
		const header = document.getElementById("header");

		if (scrollDiv && header) {
			// Calcola la posizione del target
			const headerRect = header.getBoundingClientRect();

			// Calcola la posizione centrale di ganttView come la larghezza della viewport - la larghezza dell'header
			const ganttViewCenter = (window.innerWidth - headerRect.width) / 2;

			// Calcola la posizione centrale del target
			const targetWidth = parseInt(CONSTANT.CELL_WIDTH, 10);
			const targetLeft =
				(Math.floor(CONSTANT.COL_NUM / 2) - 1) * targetWidth;
			const targetCenter = targetLeft + targetWidth / 2;

			// Calcola la distanza di scorrimento necessaria
			const scrollDistance = targetCenter - ganttViewCenter;

			// Imposta scrollLeft per centrare il target
			scrollDiv.scrollLeft = scrollDistance;
		} else {
			console.error("Elementi per centrare la data corrente non trovati");
		}
	}

	async connectedCallback() {
		await customElements.whenDefined("project-phase");
		await customElements.whenDefined("project-phase-row");
		await customElements.whenDefined("time-line");

		this.scrollToCenter();
	}
}

customElements.define("onload-functions", OnLoadFunctions);

export default OnLoadFunctions;
