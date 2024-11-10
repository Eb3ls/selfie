import { ConvertToString } from "@/utils/db/models/ModelConverter";

/*
NO COLLECTION
*/

export interface PomodoroSettings {
	modificationDate: Date;		// Data di modifica delle impostazioni
	cycles: number;				// Numero di cicli
	studyTime: number;			// Durata timer di studio, in minuti
	breakTime: number;			// Durata timer di pausa, in minuti
}

export type StringPomodoroSettings = ConvertToString<PomodoroSettings>;

export interface DayInstance {
	date: Date;					// Data di completamento del ciclo
	cycles: number;				// Numero di cicli completati
}

export type StringDayInstance = ConvertToString<DayInstance>;

export function createPomodoroSettings({
	modificationDate = new Date(new Date().toISOString()),
	cycles = 4,
	studyTime = 25,
	breakTime = 5
}: Partial<PomodoroSettings>): PomodoroSettings {
	return {
		modificationDate: modificationDate,
		cycles: cycles,
		studyTime: studyTime,
		breakTime: breakTime
	};
}

export function createDayInstance({
	date = new Date(new Date().toISOString()),
	cycles = 0
}: Partial<DayInstance>): DayInstance {
	return {
		date: date,
		cycles: cycles
	};
}
