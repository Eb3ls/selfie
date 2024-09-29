import { Alarm, StringAlarm } from "@/utils/db/models/Alarm";
import { Message, StringMessage } from "@/utils/db/models/Message";
import { Pomodoro, StringPomodoro } from "@/utils/db/models/Pomodoro";
import { ObjectId } from "mongodb";

export type ConvertToString<T> = {
	[K in keyof T]
		: T[K] extends Message[]
		? StringMessage[]
		: T[K] extends Pomodoro
		? StringPomodoro
		: T[K] extends Alarm[]
		? StringAlarm[]
		: T[K] extends Date | ObjectId
		? string
		: T[K] extends ObjectId | undefined
		? string
		: T[K] extends ObjectId | null
		? string
		: T[K] extends ObjectId[]
		? string[]
		: T[K] extends ObjectId[] | null
		? string[]
		: T[K] extends Date | null
		? string
		: T[K] extends Date[]
		? string[]
		: T[K];
};