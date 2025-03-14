import {
	StringActivity,
	StringEvent,
	StringProjectActivity,
	StringSession
} from "@/utils/db/db";

export type StringActivityFrontend = Omit<StringActivity, "userIdList"> & {
	usernameList: string[];
};

export type StringEventFrontend = Omit<StringEvent, "userIdList"> & {
	usernameList: string[];
};

export type StringSessionFrontend = StringSession;

export type StringProjectActivityFrontend = Omit<
	StringProjectActivity,
	"userIdList"
> & {
	usernameList: string[];
	projectId: string;
};

export type CalendarEvent = {
	id: string;
	title: string;
	start: Date;
	end: Date;
	typology: "activity" | "event" | "session" | "projectActivity";
	originalElement:
		| StringEventFrontend
		| StringActivityFrontend
		| StringSessionFrontend
		| StringProjectActivityFrontend;
	isRecurring: boolean;
};
