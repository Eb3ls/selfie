import { createStatusIcon, formatDate } from "../Utils";

class TimeList extends HTMLElement{

    data: any;
    sortedData: any;

    constructor(){
        super();
        this.data = null;
        this.sortedData = null;
    }

    loadData(phases: any){
        if (!phases) return;
        this.data = phases;
        this.sortedData = this.sortData();
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
        const statusBlock = createStatusIcon(item.status)
        
        block.innerHTML = `
            <div class="col-3 fw-bold">${item.summary}</div>
            <div class="col-3 text-muted">
                Start: ${start}
            </div>
            <div class="col-3 text-muted">
                Due: ${end}
            </div>
            <div class="col-3">
                ${statusBlock.innerHTML}
                ${item.status}
            </div>
        `;

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