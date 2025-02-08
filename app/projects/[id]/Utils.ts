export const ROW_HEIGHT_PX = "70px";
export const CELL_WIDTH_PX = "200px";
export const ROW_HEIGHT = parseInt(ROW_HEIGHT_PX, 10);
export const CELL_WIDTH = parseInt(CELL_WIDTH_PX, 10);
export const COL_NUM = 25;

export const waiting_color = "#6c757d";
export const activable_color = "#ffc107";
export const active_color = "#007bff";
export const submitted_color = "#28a745";
export const completed_color = "#17a2b8";
export const reactivated_color = "#6610f2";
export const overdue_color = "#dc3545";
export const dropped_color = "#343a40";

export const timeFormat = "en-US";

export interface activityData {
    _id: string;
    summary: string;
    description: string;
    dtStart: string;
    due: string;
    isMilestone: boolean;
    usernameList: string[];
}

export interface user{
    name: string;
    id: string;
}

export interface activity{
    name: string;
    id: string;
}

// Formatta la data ISO per l'input date (yyyy-mm-dd unico formato supportato per min-max)
export function formatDate(date: string): string {
    return date.split('T')[0];
}
export function validateUsername(username: string): boolean {
    const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
    return usernameRegex.test(username);
}

export function validateLenght(str: string, min: number, max: number): boolean {
    return str.length >= min && str.length <= max;
}

export const statusConfig = {
	WAITING: { color: waiting_color, text: "In attesa" },
	ACTIVABLE: { color: activable_color, text: "Attivabile" },
	ACTIVE: { color: active_color, text: "Attivo" },
	SUBMITTED: { color: submitted_color, text: "Consegnato" },
	COMPLETED: { color: completed_color, text: "Completato" },
	REACTIVATED: { color: reactivated_color, text: "Riattivato" },
	OVERDUE: { color: overdue_color, text: "Scaduto" },
	DROPPED: { color: dropped_color, text: "Abbandonato" }
};

// Status icon

// Funzione per creare una singola entry per la lista di stati
function createStatusEntry(status: keyof typeof statusConfig, iconBlock: HTMLElement): HTMLElement {
    const item = document.createElement("li");
    const link = document.createElement("a");
    const value = statusConfig[status as keyof typeof statusConfig];
    link.className = "dropdown-item d-flex align-items-center py-2";

    const statusDot = document.createElement("i");
    statusDot.className = "bi bi-circle-fill me-2";
    statusDot.style.color = value.color;
    
    const text = document.createElement("span");
    text.textContent = value.text;
    
    link.appendChild(statusDot);
    link.appendChild(text);
    
    link.onclick = (e) => {
        e.preventDefault();
        console.log("Status changed to", value.text);
        // Necesario per aggiornare l'icona dello stato con le possibilitá corrette
        iconBlock.replaceWith(createStatusIcon(status));
    };

    item.appendChild(link);
    return item;
}

// Funzione per creare la lista di stati coerenti con l'attuale
function createStatusList(currentStatus: keyof typeof statusConfig, iconBlock: HTMLElement): HTMLElement[] {
    let statusList: (keyof typeof statusConfig)[] = []
    if(currentStatus === "WAITING"){
        statusList = ["ACTIVABLE", "DROPPED"]
    }
    else if(currentStatus === "ACTIVABLE"){
        statusList = ["ACTIVE", "DROPPED"]
    }
    else if(currentStatus === "ACTIVE"){
        statusList = ["SUBMITTED", "DROPPED"]
    }
    else if(currentStatus === "SUBMITTED"){
        statusList = ["REACTIVATED", "COMPLETED", "DROPPED"]
    }
    else if(currentStatus === "REACTIVATED"){
        statusList = ["COMPLETED", "DROPPED"]
    }
    else if(currentStatus === "OVERDUE"){
        statusList = ["COMPLETED", "DROPPED"]
    }

    const list = [];
    for (const status of statusList) {
        list.push(createStatusEntry(status, iconBlock));
    }
    return list;
}

// Funzione per ottenere l'icona dello stato
export function createStatusIcon(status: keyof typeof statusConfig): HTMLElement {

    const wrapper = document.createElement("div");
    wrapper.className = "dropdown d-inline-block";

    const dropdownButton = document.createElement("button");
    dropdownButton.className = "btn btn-link p-0 border-0";

    const icon = document.createElement("i");
    icon.className = "bi bi-circle-fill fs-5 me-3";
    
    const currentStatus = statusConfig[status as keyof typeof statusConfig];
    if (currentStatus) {
        icon.style.color = currentStatus.color;
        icon.setAttribute("title", currentStatus.text);
    }

    dropdownButton.appendChild(icon);
    wrapper.appendChild(dropdownButton);
    if(status !== "COMPLETED" && status !== "DROPPED"){
        // Creiamo il dropdown menu
        dropdownButton.setAttribute("data-bs-toggle", "dropdown");
        dropdownButton.setAttribute("aria-expanded", "false");

        const menu = document.createElement("ul");
        menu.className = "dropdown-menu p-0 shadow";
        
        // Creiamo gli elementi coerenti con lo stato attuale
        const statusEntries = createStatusList(status, wrapper);
        for (const entry of statusEntries) {
            menu.appendChild(entry);
        }
        wrapper.appendChild(menu);
    }

    return wrapper;
}