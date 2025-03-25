import {
	PhaseResponse,
	SortedActivity,
	SubPhaseResponse,
	User
} from "../Utils";
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

	render(currentUser: User, isOwner: boolean) {
		this.className = "px-3";
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

			let isAnimating = false; // Variabile per bloccare i click durante l'animazione

			const caretIcon = document.createElement("i");
			caretIcon.className = "bi bi-caret-right-fill me-3 fs-5";
			caretIcon.style.transition = "transform 0.2s";
			caretIcon.setAttribute("data-bs-toggle", "collapse");
			caretIcon.setAttribute("data-bs-target", `#collapse${user}`);
			caretIcon.onclick = () => {
				// Se l'animazione é in corso non facciamo nulla
				if (isAnimating) return;
				isAnimating = true;
				let animation;
				if (caretIcon.style.transform === "rotate(90deg)") {
					animation = "rotate(0)";
				} else {
					animation = "rotate(90deg)";
				}
				caretIcon.style.transform = animation;
			};
			toggler.appendChild(caretIcon);

			// Creiamo il div con il nome dell'utente
			const button = document.createElement("button");
			button.className =
				"btn btn-primary rounded-3 px-4 py-2 flex-grow-1 text-start";
			button.textContent = user;
			toggler.appendChild(button);

			// Creiamo il blocco collasabile
			const collapse = document.createElement("div");
			collapse.id = `collapse${user}`;
			collapse.className = "collapse ms-3";
			// Aggiungiamo l'evento per sbloccare il click
			collapse.addEventListener("shown.bs.collapse", () => {
				isAnimating = false;
			});

			collapse.addEventListener("hidden.bs.collapse", () => {
				isAnimating = false;
			});

			const userActivitiesBlock = document.createElement(
				"time-list"
			) as TimeList;
			userActivitiesBlock.loadProjectData(
				this.data[user],
				currentUser,
				isOwner
			);
			collapse.appendChild(userActivitiesBlock);

			container.appendChild(toggler);
			container.appendChild(collapse);

			this.appendChild(container);
		}
	}

	public loadProjectData(
		phases: PhaseResponse[],
		currentUser: User,
		isOwner: boolean
	) {
		if (!phases) return;

		this.phases = phases;
		this.data = this.sortData();
		this.render(currentUser, isOwner);
	}
}

customElements.define("users-list", UsersList);

export default UsersList;
