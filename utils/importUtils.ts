import {
	parseJSONInput,
	isValidEmail,
	removeArrayDuplicates,
	getArrayIntersection,
	stringsToObjects,
	isTemplateValid,
	isTemplateSubset,
	standardValidation,
	getIdFromUsername,
	generateMessageResponse,
	generateObjectResponse,
} from "@/utils/api/api";

import clientPromise from "@/utils/db/db";
import { User, StringUser } from "@/utils/db/models/User";
import { Event, StringEvent } from "@/utils/db/models/Event";
import { Activity, StringActivity } from "@/utils/db/models/Activity";
import { Chat, StringChat } from "@/utils/db/models/Chat";
import { Session, StringSession } from "@/utils/db/models/Session";
import { GroupChat, StringGroupChat } from "@/utils/db//models/GroupChat";
import { Note, StringNote } from "@/utils/db/models/Note";
import { Phase, StringPhase } from "@/utils/db/models/Phase";
import { Project, StringProject } from "@/utils/db/models/Project";
import {
	ProjectActivity,
	StringProjectActivity,
} from "@/utils/db/models/ProjectActivity";

import {
	USER_COLLECTION,
	EVENT_COLLECTION,
	ACTIVITY_COLLECTION,
	CHAT_COLLECTION,
	SESSION_COLLECTION,
	GROUP_CHAT_COLLECTION,
	NOTE_COLLECTION,
	PHASE_COLLECTION,
	PROJECT_COLLECTION,
	PROJECT_ACTIVITY_COLLECTION,
	Schema,
	StringSchema,
	getCollection,
	addToCollection,
	addAndFetchToCollection,
	findInCollection,
	deleteInCollection,
	deleteManyInCollection,
	updateOneInCollection,
	updateOneAndFetchInCollection,
	updateManyInCollection,
	updateManyAndFetchInCollection,
} from "@/utils/db/db_functions";

import {
	addCollectionWrapper,
	findCollectionWrapper,
	deleteCollectionWrapper,
	updateCollectionWrapper,
} from "@/utils/db/db_wrappers";

import {
	fromModelToStringModel,
	removeArrayDuplicates,
	areIdFieldsValid,
	stringsToObjectId,
	isTemplateValid,
	isTemplateSubset,
	validate,
	usernameListToIds,
} from "@/utils/refactor/refactor";

import {
	encrypt,
	decrypt,
	login,
	logout,
	getSession,
	isValidSession,
	updateSession,
} from "@/utils/session/session";
