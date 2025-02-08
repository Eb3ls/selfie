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
        for(const user in this.data){
            const userActivitiesBlock = document.createElement("time-list") as TimeList;
            userActivitiesBlock.loadData(this.data[user], true);

            const userBlock = document.createElement("div");
            userBlock.className = "mt-3";
            userBlock.textContent = user;

            this.appendChild(userBlock); 
            this.appendChild(userActivitiesBlock);
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