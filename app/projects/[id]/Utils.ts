import { Alarm } from "@/utils/db/models/Alarm";

export const ROW_HEIGHT_PX = "70px";
export const CELL_WIDTH_PX = "200px";
export const ROW_HEIGHT = parseInt(ROW_HEIGHT_PX, 10);
export const CELL_WIDTH = parseInt(CELL_WIDTH_PX, 10);

export const waiting_color = "#6c757d";
export const activable_color = "#ffc107";
export const active_color = "#007bff";
export const submitted_color = "#28a745";
export const completed_color = "#17a2b8";
export const reactivated_color = "#6610f2";
export const overdue_color = "#dc3545";
export const dropped_color = "#343a40";

export const timeFormat = "en-US";

// TODO sono copiati dalla risposta del server, vanno spostati in un file comune

export interface User {
	id: string;
	name: string;
}
export interface ProjectResponse {
	_id: string;
	summary: string;
	owner: User;
	users: User[];
	noteId: string;
	phases: PhaseResponse[];
}

export interface PhaseResponse {
	_id: string;
	summary: string;
	owner: { id: string; name: string };
	dtStart: string;
	due: string;
	subPhases: SubPhaseResponse[];
	activities: ProjectActivityResponse[];
}

export interface SubPhaseResponse {
	_id: string;
	summary: string;
	owner: User;
	dtStart: string;
	due: string;
	activities: ProjectActivityResponse[];
}

export interface Link {
	_id: string;
	summary: string;
	date: string;
}

export interface ProjectActivityResponse {
	_id: string;
	summary: string;
	description: string;
	status: string;
	dtStart: string;
	due: string;
	isMilestone: boolean;
	owner: User;
	users: User[];
	prevLinks: Link[];
	prevMaxDue: string;
	nextLinks: Link[];
	nextMinStart: string;
	alarms: Alarm[];
	noteId?: string;
	noteLink: string | null;
}
// Interfaccia per le attivitá ordinate, aggiungiamo il riferimento alla fase genitore
export interface SortedActivity extends ProjectActivityResponse {
	parentPhase: PhaseResponse;
}

export interface PhaseToggleMap {
	[phaseId: string]: {
		// Stato del toggle della fase
		isOpen: boolean;
		// Mappa degli id delle sottofasi e il loro stato del toggle
		subPhases: {
			[subPhaseId: string]: boolean;
		};
	};
}

export function setToggleState(
	map: PhaseToggleMap,
	phaseId: string,
	parentId: string | null,
	state: boolean
): void {
	if (parentId && map[parentId]) {
		map[parentId].subPhases[phaseId] = state;
	} else if (map[phaseId]) {
		map[phaseId].isOpen = state;
	}
}

export function getToggleState(
	map: PhaseToggleMap,
	phaseId: string,
	parentId: string | null
): boolean {
	if (parentId && map[parentId]) {
		return map[parentId].subPhases[phaseId];
	}
	if (map[phaseId]) {
		return map[phaseId].isOpen;
	}
	return false;
}

// Formatta la data ISO per l'input date (yyyy-mm-dd unico formato supportato per min-max)
export function formatDate(date: string): string {
	return date.split("T")[0];
}

export function validateUsername(username: string): boolean {
	if (!username) return false;
	const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
	return usernameRegex.test(username);
}

export function validateLength(
	item: string,
	min: number,
	max: number
): boolean {
	if (!item) return false;
	return item.length >= min && item.length <= max;
}

// Controlliamo se la data é dentro i limiti della fase/sottofase
export function checkDate(date: string, start: string, due: string): boolean {
	const newDate = new Date(date);
	const startDate = new Date(start);
	const dueDate = new Date(due);

	if (newDate >= startDate && newDate <= dueDate) {
		return true;
	}
	return false;
}

export function calculateCells(element: HTMLElement): number {
	const width = element.clientWidth || element.getBoundingClientRect().width;
	const cols = Math.floor(width / CELL_WIDTH) * 2;
	return Math.max(cols, 18);
}

export function showError(inputElement: HTMLElement, message: string) {
	const errorDiv = document.createElement("div");
	errorDiv.className = "invalid-feedback d-block";
	errorDiv.textContent = message;
	inputElement.classList.add("is-invalid");
	inputElement.parentElement?.appendChild(errorDiv);
}

export function clearError(inputElement: HTMLElement) {
	inputElement.classList.remove("is-invalid");
	const errorDiv =
		inputElement.parentElement?.querySelector(".invalid-feedback");
	if (errorDiv) errorDiv.remove();
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
export function createStatusEntry(
	status: keyof typeof statusConfig,
	iconBlock: HTMLElement,
	activityId: string
): HTMLElement {
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

	link.onclick = async (e) => {
		e.preventDefault();
		const url = `/api/project/activity/modifyStatus`;
		const method = "PATCH";
		const body = {
			_id: activityId,
			status: status
		};
		try {
			await fetcher(method, url, body);
			window.location.reload();
		} catch (error) {
			alert("Errore durante la modifica dello stato");
			console.error(error);
		}
	};

	item.appendChild(link);
	return item;
}

// Funzione per creare la lista di stati coerenti con l'attuale
export function createStatusList(
	currentStatus: keyof typeof statusConfig,
	iconBlock: HTMLElement,
	activityId: string
): HTMLElement[] {
	let statusList: (keyof typeof statusConfig)[] = [];
	if (currentStatus === "WAITING") {
		statusList = ["ACTIVABLE", "DROPPED"];
	} else if (currentStatus === "ACTIVABLE") {
		statusList = ["ACTIVE", "DROPPED"];
	} else if (currentStatus === "ACTIVE") {
		statusList = ["SUBMITTED", "DROPPED"];
	} else if (currentStatus === "SUBMITTED") {
		statusList = ["REACTIVATED", "COMPLETED"];
	} else if (currentStatus === "REACTIVATED") {
		statusList = ["SUBMITTED", "DROPPED"];
	} else if (currentStatus === "OVERDUE") {
		statusList = ["SUBMITTED", "DROPPED"];
	}

	const list = [];
	for (const status of statusList) {
		list.push(createStatusEntry(status, iconBlock, activityId));
	}
	return list;
}

// Funzione per ottenere l'icona dello stato
export function createStatusIcon(
	status: keyof typeof statusConfig,
	activityId: string,
	hasPermission: boolean,
	isOwner: boolean
): HTMLElement {
	const wrapper = document.createElement("div");
	wrapper.className = "dropdown d-inline-block";

	const dropdownButton = document.createElement("button");
	dropdownButton.className = "btn btn-link p-0 border-0";

	const icon = document.createElement("i");
	icon.className = "bi bi-circle-fill fs-5 me-3";

	const currentStatus = statusConfig[status];
	if (currentStatus) {
		icon.style.color = currentStatus.color;
		icon.setAttribute("title", currentStatus.text);
	}

	dropdownButton.appendChild(icon);
	wrapper.appendChild(dropdownButton);
	if (
		status !== "COMPLETED" &&
		status !== "DROPPED" &&
		(hasPermission || isOwner)
	) {
		if (status === "SUBMITTED" && !isOwner) {
			return wrapper;
		}
		// Creiamo il dropdown menu
		dropdownButton.setAttribute("data-bs-toggle", "dropdown");
		dropdownButton.setAttribute("aria-expanded", "false");

		const menu = document.createElement("ul");
		menu.className = "dropdown-menu p-0 shadow";

		// Creiamo gli elementi coerenti con lo stato attuale
		const statusEntries = createStatusList(status, wrapper, activityId);
		for (const entry of statusEntries) {
			menu.appendChild(entry);
		}
		wrapper.appendChild(menu);
	}

	return wrapper;
}

export async function fetcher(
	method: "GET" | "POST" | "PATCH" | "DELETE",
	url: string,
	data?: any
): Promise<any> {
	const response = await fetch(url, {
		method: method,
		headers: {
			"Content-Type": "application/json"
		},
		body: data ? JSON.stringify(data) : undefined
	});

	if (response.ok) {
		return response.json();
	} else {
		throw new Error(response.statusText);
	}
}
