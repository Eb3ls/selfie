import { StringMessage } from "@/utils/db/db";

export type UserElement = {
	_id: string;
	username: string;
	userStatus: string;
};

export type ChatEntry = {
	_id: string;
	isGroup: boolean;
	summary: string;
	userIdList: string[]; // Lista degli utenti (Il primo è il proprietario)
	createdAt: string;
	lastMessageAt: string | null;
	lastMessage: StringMessage | null;
};

export type ChatResponse = {
	chatList: ChatEntry[];
	userList: UserElement[];
	whoAmI: UserElement;
};
