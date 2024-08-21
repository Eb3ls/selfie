// DB client
import { clientPromise } from "@/utils/db/db_client";
// DB functions
import {
	ACTIVITY_COLLECTION,
	CHAT_COLLECTION,
	EVENT_COLLECTION,
	GROUP_CHAT_COLLECTION,
	NOTE_COLLECTION,
	PHASE_COLLECTION,
	PROJECT_ACTIVITY_COLLECTION,
	PROJECT_COLLECTION,
	SESSION_COLLECTION,
	Schema,
	StringSchema,
	USER_COLLECTION,
	addAndFetchToCollection,
	addToCollection,
	deleteInCollection,
	deleteManyInCollection,
	findInCollection,
	getCollection,
	updateManyAndFetchInCollection,
	updateManyInCollection,
	updateOneAndFetchInCollection,
	updateOneInCollection
} from "@/utils/db/db_functions";
// DB wrappers
import {
	addCollectionWrapper,
	deleteCollectionWrapper,
	findCollectionWrapper,
	updateCollectionWrapper
} from "@/utils/db/db_wrappers";
// Db models
import {
	Activity,
	StringActivity,
	createActivity
} from "@/utils/db/models/Activity";
import { Alarm, StringAlarm, createAlarm } from "@/utils/db/models/Alarm";
import { Chat, StringChat, createChat } from "@/utils/db/models/Chat";
import { Event, StringEvent, createEvent } from "@/utils/db/models/Event";
import {
	GroupChat,
	StringGroupChat,
	createGroupChat
} from "@/utils/db/models/GroupChat";
import {
	Message,
	StringMessage,
	createMessage
} from "@/utils/db/models/Message";
import { Note, StringNote, createNote } from "@/utils/db/models/Note";
import { Phase, StringPhase, createPhase } from "@/utils/db/models/Phase";
import {
	Pomodoro,
	StringPomodoro,
	createPomodoro
} from "@/utils/db/models/Pomodoro";
import {
	Project,
	StringProject,
	createProject
} from "@/utils/db/models/Project";
import {
	ProjectActivity,
	StringProjectActivity,
	createProjectActivity
} from "@/utils/db/models/ProjectActivity";
import {
	Session,
	StringSession,
	createSession
} from "@/utils/db/models/Session";
import { StringUser, User, createUser } from "@/utils/db/models/User";

// Export everything
export {
	clientPromise,
	ACTIVITY_COLLECTION,
	CHAT_COLLECTION,
	EVENT_COLLECTION,
	GROUP_CHAT_COLLECTION,
	NOTE_COLLECTION,
	PHASE_COLLECTION,
	PROJECT_ACTIVITY_COLLECTION,
	PROJECT_COLLECTION,
	SESSION_COLLECTION,
	USER_COLLECTION,
	addAndFetchToCollection,
	addToCollection,
	deleteInCollection,
	deleteManyInCollection,
	findInCollection,
	getCollection,
	updateManyAndFetchInCollection,
	updateManyInCollection,
	updateOneAndFetchInCollection,
	updateOneInCollection,
	addCollectionWrapper,
	deleteCollectionWrapper,
	findCollectionWrapper,
	updateCollectionWrapper,
	createActivity,
	createChat,
	createEvent,
	createGroupChat,
	createNote,
	createPhase,
	createProject,
	createProjectActivity,
	createSession,
	createUser,
	createAlarm,
	createMessage,
	createPomodoro
};

export type {
	Schema,
	StringSchema,
	StringActivity,
	StringChat,
	StringEvent,
	StringGroupChat,
	StringNote,
	StringPhase,
	StringProject,
	StringProjectActivity,
	StringSession,
	StringUser,
	StringAlarm,
	StringMessage,
	StringPomodoro,
	Activity,
	Chat,
	Event,
	GroupChat,
	Note,
	Phase,
	Project,
	ProjectActivity,
	Session,
	User,
	Alarm,
	Message,
	Pomodoro
};
