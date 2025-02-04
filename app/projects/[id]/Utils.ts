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