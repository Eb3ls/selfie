import TimeList from "./TimeList";

class UsersList extends HTMLElement {
    phases: any;
    data: any;

    constructor() {
        super();
        this.phases = null;
        this.data = null;
    }

    sortData(){
        const userData: any= {}

        function appendUserActivities(phase: any){
            for (const activity of phase.activities){
                for(const user of activity.users){
                    if (!userData[user.name]) userData[user.name] = [];
                    console.log("User:", user);
                    console.log("Activity:", activity.summary);
                    userData[user.name].push(activity);
                }
            }

            if (!phase.subPhases) return;
            for(const subPhase of phase.subPhases){
                appendUserActivities(subPhase);
            }
        }

        for (const phase of this.phases){
            appendUserActivities(phase);
        }

        return userData;
    }

    render() {

        if(Object.keys(this.data).length === 0) {
            const noActivities = document.createElement('div');
            noActivities.className = 'alert alert-info text-center m-3';
            noActivities.innerHTML = '<i class="bi bi-info-circle me-2"></i>Nessuna attività assegnata';
            this.appendChild(noActivities);
            return;
        }

        for(const user in this.data) {
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
                caretIcon.style.transform = caretIcon.style.transform === "rotate(90deg)" ? "rotate(0)" : "rotate(90deg)";
            };
            toggler.appendChild(caretIcon);

            // Creiamo il div con il nome dell'utente
            const button = document.createElement("button");
            button.className = "btn btn-primary rounded-3 px-4 py-2 flex-grow-1 text-start";
            button.textContent = user;
            toggler.appendChild(button);

            // Creiamo il blocco collasabile
            const userActivitiesBlock = document.createElement("time-list") as TimeList;
            userActivitiesBlock.loadData(this.data[user], true);
            userActivitiesBlock.id = `collapse${user}`;
            userActivitiesBlock.className = "collapse";

            
            container.appendChild(toggler);
            container.appendChild(userActivitiesBlock);
            
            this.appendChild(container);
        }
    }

    public loadData(phases: any) {
        if (!phases) return;

        this.phases = phases;
        this.data = this.sortData();
        this.render();
    }

}

customElements.define('users-list', UsersList);

export default UsersList;