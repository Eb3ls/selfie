export interface ReducedNote {
	_id: string;
	summary: string;
	categories: string;
	dtModified: string;
}

export interface ReducedProject {
	_id: string;
	summary: string;
	noteId: string;
}

export interface ReducedChat {
	_id: string;
	summary: string;
	lastMessage: string | null;
	lastMessageOwner: string | null;
	lastMessageAt: string | null;
}

export interface ReducedActivity {
	_id: string;
	summary: string;
	description: string;
	data: string;
	ownerName: string;
}

export interface ReducedProjectActivity {
	_id: string;
	summary: string;
	description: string;
	data: string;
	ownerName: string;
}

export interface ReducedEvent {
	_id: string;
	summary: string;
	description: string;
	data: string;
	ownerName: string;
}

export interface ReducedSession {
	_id: string;
	summary: string;
	description: string;
	data: string;
	ownerName: string;
}

export interface ReducedCalendar {
	activities: ReducedActivity[];
	projectActivities: ReducedProjectActivity[];
	events: ReducedEvent[];
	sessions: ReducedSession[];
}

export interface PreviewsResponse {
	notes: ReducedNote[];
	projects: ReducedProject[];
	chats: ReducedChat[];
	calendar: ReducedCalendar;
}
