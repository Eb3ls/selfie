import { PhaseResponse, SortedActivity, SubPhaseResponse } from "../Utils";
import TimeList from "./TimeList";

class UsersList extends HTMLElement {
	phases: PhaseResponse[];
	data: { [username: string]: SortedActivity[] };

	constructor() {
		super();
		this.phases = [];
		this.data = {};
	}

	sortData() {
		const userData: { [username: string]: SortedActivity[] } = {};

		function appendUserActivities(phase: PhaseResponse | SubPhaseResponse) {
			for (const activity of phase.activities) {
				for (const user of activity.users) {
					if (!userData[user.name]) userData[user.name] = [];
					const act = activity as SortedActivity;
					act.parentPhase = phase as PhaseResponse;
					userData[user.name].push(act);
				}
			}

			if (!("subPhases" in phase)) return;
			for (const subPhase of phase.subPhases) {
				appendUserActivities(subPhase);
			}
		}

		for (const phase of this.phases) {
			appendUserActivities(phase);
		}

		for (const user in userData) {
			userData[user].sort((a, b) => {
				return a.due < b.due ? -1 : 1;
			});
		}

		return userData;
	}

	render() {
		if (Object.keys(this.data).length === 0) {
			const noActivities = document.createElement("div");
			noActivities.className = "alert alert-info text-center m-3";
			noActivities.innerHTML =
				'<i class="bi bi-info-circle me-2"></i>Nessuna attività assegnata';
			this.appendChild(noActivities);
			return;
		}

		for (const user in this.data) {
			const container = document.createElement("div");
			container.className = "mt-3";

			// Creiamo il toggler
			const toggler = document.createElement("div");
			toggler.className = "d-flex align-items-center";

			// Creiamo l'icona del caret
			const caretIcon = document.createElement("i");
			caretIcon.className = "bi bi-caret-right-fill me-3 fs-5";
			caretIcon.style.transition = "transform 0.2s";
			caretIcon.setAttribute("data-bs-toggle", "collapse");
			caretIcon.setAttribute("data-bs-target", `#collapse${user}`);
			caretIcon.onclick = () => {
				caretIcon.style.transform =
					caretIcon.style.transform === "rotate(90deg)"
						? "rotate(0)"
						: "rotate(90deg)";
			};
			toggler.appendChild(caretIcon);

			// Creiamo il div con il nome dell'utente
			const button = document.createElement("button");
			button.className =
				"btn btn-primary rounded-3 px-4 py-2 flex-grow-1 text-start";
			button.textContent = user;
			toggler.appendChild(button);

			// Creiamo il blocco collasabile
			const userActivitiesBlock = document.createElement(
				"time-list"
			) as TimeList;
			userActivitiesBlock.loadData(this.data[user]);
			userActivitiesBlock.id = `collapse${user}`;
			userActivitiesBlock.className = "collapse";

			container.appendChild(toggler);
			container.appendChild(userActivitiesBlock);

			this.appendChild(container);
		}
	}

	public loadData(phases: PhaseResponse[]) {
		if (!phases) return;

		this.phases = phases;
		this.data = this.sortData();
		this.render();
	}
}

customElements.define("users-list", UsersList);

export default UsersList;
