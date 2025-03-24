import { ConvertToString } from "@/utils/db/models/ModelConverter";

/*
NO COLLECTION
*/

export const ONE_DAY_BEFORE = "-PT1D";
export const ONE_HOUR_BEFORE = "-PT1H";
export const TEN_MINUTES_BEFORE = "-PT10M";
export const AT_THE_TIME = "-PT0S";

export type Trigger = typeof ONE_DAY_BEFORE | typeof ONE_HOUR_BEFORE | typeof TEN_MINUTES_BEFORE | typeof AT_THE_TIME;

export interface Alarm {
	trigger: Trigger							// Quanto prima o dopo dovrà essere attivato. Es: trigger: -PT30M (scatta 30 minuti prima), trigger: PT5M (scatta 5 minuti dopo)
}

export type StringAlarm = ConvertToString<Alarm>;

export function createAlarm({
	trigger = AT_THE_TIME
}: Partial<Alarm>): Alarm {
	return {
		trigger: trigger
	};
}
