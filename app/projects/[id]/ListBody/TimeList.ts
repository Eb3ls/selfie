import { createStatusIcon, formatDate } from "../Utils";

class TimeList extends HTMLElement{

    data: any;
    sortedData: any;

    constructor(){
        super();
        this.data = null;
        this.sortedData = null;
    }

    loadData(phases: any, userView: boolean){
        if (!phases) return;

        // Se siamo nella view a lista per utente passiamo direttamente le activities
        if(userView){
            this.data = phases;
            this.sortedData = phases;
        }
        else{
            this.data = phases;
            this.sortedData = this.sortData();
        }
        this.render();
    }

    // TODO finire il sorting
    sortData(){
        const allActivities: any= [];

        function apppendActivities(phase: any){
            for (const activity of phase.activities){
                allActivities.push(activity)
            }

            if (!phase.subPhases) return;
            for(const subPhase of phase.subPhases){
                apppendActivities(subPhase);
            }
        }

        for (const phase of this.data){
            apppendActivities(phase);
        }

        return allActivities;
    }

    createItem(item: any){
        const block = document.createElement("div");
        block.className = "row p-2 border rounded mt-3";
        block.style.backgroundColor = "#f8f9fa";

        const start = new Date(formatDate(item.dtStart)).toLocaleDateString();
        const end = new Date(formatDate(item.due)).toLocaleDateString();

        // Create columns using DOM methods instead of innerHTML
        const summaryCol = document.createElement("div");
        summaryCol.className = "col-3 fw-bold";
        summaryCol.textContent = item.summary;

        const startCol = document.createElement("div");
        startCol.className = "col-3 text-muted";
        startCol.textContent = `Start: ${start}`;

        const dueCol = document.createElement("div");
        dueCol.className = "col-3 text-muted";
        dueCol.textContent = `Due: ${end}`;

        const statusCol = document.createElement("div");
        statusCol.className = "col-3";

        // Create status elements
        const statusBlock = createStatusIcon(item.status);
        statusCol.appendChild(statusBlock);
        statusCol.appendChild(document.createTextNode(item.status));

        // Append all columns to the block
        block.appendChild(summaryCol);
        block.appendChild(startCol);
        block.appendChild(dueCol);
        block.appendChild(statusCol);

        return block;
    }

    render(){
        this.innerHTML = '';
        for (const num in this.sortedData){
            const activity = this.sortedData[num]
            this.appendChild(this.createItem(activity));
        }
    }

}

customElements.define("time-list", TimeList);

export default TimeList;