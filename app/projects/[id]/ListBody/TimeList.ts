import ModifyActivity from "../Forms/ActivityForm";
import ModifyPhase from "../Forms/PhaseForm";
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
                activity.phase = phase;
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

	// Funzione per aggiungere i dati al modale
	openModify(activity: any, phase: any) {
		const modifyModal = document.getElementById(`ModifyActivityComponent`) as ModifyActivity;

		if (!modifyModal) {
			console.error(`Errore: modale per modifica delle activity non trovato`);
			return;
		}

		modifyModal.updateData(activity, phase);
	}

    createItem(item: any){
        const block = document.createElement("div");
        block.className = "row rounded p-2 mt-3 border-bottom border-secondary list-item";
        block.addEventListener("click", () => {
            this.openModify(item, item.phase);
        });
        block.setAttribute("data-bs-toggle", "modal");
        block.setAttribute("data-bs-target", "#ModifyActivity");

        const start = new Date(formatDate(item.dtStart)).toLocaleDateString();
        const end = new Date(formatDate(item.due)).toLocaleDateString();

        const summaryCol = document.createElement("div");
        summaryCol.className = "col-3 fw-bold";
        summaryCol.textContent = item.summary;

        const startCol = document.createElement("div");
        startCol.className = "col-3 text-muted";
        startCol.textContent = `${start}`;

        const dueCol = document.createElement("div");
        dueCol.className = "col-3 text-muted";
        dueCol.textContent = `${end}`;

        const statusCol = document.createElement("div");
        statusCol.className = "col-3";

        // Creiamo il blocco per lo status
        const statusBlock = createStatusIcon(item.status);
        statusCol.appendChild(statusBlock);
        statusCol.appendChild(document.createTextNode(item.status));

        block.appendChild(summaryCol);
        block.appendChild(startCol);
        block.appendChild(dueCol);
        block.appendChild(statusCol);

        return block;
    }

    render(){
        this.innerHTML = '';
        const innerBlock = document.createElement("div");
        innerBlock.className = "container-fluid mt-3 px-4";
        this.appendChild(innerBlock);

        const header = document.createElement("div");
        header.className = "row p-2 border-bottom border-secondary rounded";
        innerBlock.appendChild(header);

        const summaryHeader = document.createElement("div");
        summaryHeader.className = "col-3 fw-bold";
        summaryHeader.textContent = "Titolo";
        header.appendChild(summaryHeader);

        const startHeader = document.createElement("div");
        startHeader.className = "col-3 fw-bold";
        startHeader.textContent = "Start Date";
        header.appendChild(startHeader);

        const dueHeader = document.createElement("div");
        dueHeader.className = "col-3 fw-bold";
        dueHeader.textContent = "Due Date";
        header.appendChild(dueHeader);

        const statusHeader = document.createElement("div");
        statusHeader.className = "col-3 fw-bold";
        statusHeader.textContent = "Status";
        header.appendChild(statusHeader);


        for (const num in this.sortedData){
            const activity = this.sortedData[num]
            innerBlock.appendChild(this.createItem(activity));
        }
    }

}

customElements.define("time-list", TimeList);

export default TimeList;