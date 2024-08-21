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
import { Activity, StringActivity } from "@/utils/db/models/Activity";
import { Chat, StringChat } from "@/utils/db/models/Chat";
import { Event, StringEvent } from "@/utils/db/models/Event";
import { GroupChat, StringGroupChat } from "@/utils/db/models/GroupChat";
import { Note, StringNote } from "@/utils/db/models/Note";
import { Phase, StringPhase } from "@/utils/db/models/Phase";
import { Project, StringProject } from "@/utils/db/models/Project";
import {
	ProjectActivity,
	StringProjectActivity
} from "@/utils/db/models/ProjectActivity";
import { Session, StringSession } from "@/utils/db/models/Session";
import { StringUser, User } from "@/utils/db/models/User";

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
	updateCollectionWrapper
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
	Activity,
	Chat,
	Event,
	GroupChat,
	Note,
	Phase,
	Project,
	ProjectActivity,
	Session,
	User
};
