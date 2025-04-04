"use client";

import { ModifyActivityModal } from "@/app/calendar/ModifyModals/ModifyActivityModal";
import { ModifyEventModal } from "@/app/calendar/ModifyModals/ModifyEventModal";
import { ModifySessionModal } from "@/app/calendar/ModifyModals/ModifySessionModal";
import {
	CalendarEvent,
	StringActivityFrontend,
	StringEventFrontend,
	StringSessionFrontend
} from "@/app/calendar/calendarUtils/calendarTypes";
import { useUser } from "../components/UserContext";

interface ModifyModalProps {
	calendarEvent: CalendarEvent;
	showModal: boolean;
	setShowModal: (value: boolean) => void;
}

export function GenericModifyModal({
	calendarEvent,
	showModal,
	setShowModal
}: ModifyModalProps) {
	const { user } = useUser();

	if (calendarEvent.typology === "activity") {
		const activity =
			calendarEvent.originalElement as StringActivityFrontend;
		return (
			<ModifyActivityModal
				show={showModal}
				setShow={setShowModal}
				activity={activity}
				currentUserId={user?._id || ""}
			/>
		);
	} else if (calendarEvent.typology === "event") {
		const event = calendarEvent.originalElement as StringEventFrontend;
		return (
			<ModifyEventModal
				show={showModal}
				setShow={setShowModal}
				event={event}
				currentUserId={user?._id || ""}
			/>
		);
	} else if (calendarEvent.typology === "session") {
		const session = calendarEvent.originalElement as StringSessionFrontend;
		return (
			<ModifySessionModal
				show={showModal}
				setShow={setShowModal}
				session={session}
				startOfSelectedSession={calendarEvent.start}
			/>
		);
	} else {
		return <></>;
	}
}
